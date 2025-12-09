from sentence_transformers import SentenceTransformer
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional

class PersonalInfo(BaseModel):
    firstname: str
    lastname: str
    phone: Optional[str] = None
    email: str

class EducationItem(BaseModel):
    institution: str
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    major: Optional[str] = None
    minor: Optional[str] = None
    degree: Optional[str] = None

class WorkItem(BaseModel):
    title: str
    company: str
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    location: Optional[str] = None
    description: List[str] = [] 

class ProjectItem(BaseModel):
    title: str
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    tools: List[str] = []
    descriptions: List[str] = []

class UserProfile(BaseModel):
    personal: PersonalInfo
    work: List[WorkItem] = []
    projects: List[ProjectItem] = [] 
    education: List[EducationItem] = []
    skills: List[str] = [] 
    websites: List[str] = []

class NewJob(BaseModel):
    title:str
    description:str

app = FastAPI()

# model used
model = SentenceTransformer('all-MiniLM-L6-v2')


@app.post("/")
def rank_relevance(user_profile:UserProfile,new_job:NewJob):
    target_job_title = model.encode(new_job.title, convert_to_tensor=True)
    target_job_desc = model.encode(new_job.description,convert_to_tensor=True)

    work = user_profile.work
    projects = user_profile.projects
    skills = user_profile.skills

    encoded_job_titles = model.encode([job.title for job in work], convert_to_tensor=True)
    encoded_job_descs = model.encode([" ".join(job.description) for job in work],convert_to_tensor=True)
    encoded_skills = model.encode(skills, convert_to_tensor=True)
    encoded_projects = model.encode([" ".join(project.descriptions) for project in projects], convert_to_tensor=True)

    #job compares both title and description
    job_title_similarities = model.similarity(target_job_title,encoded_job_titles)
    job_desc_similarities = model.similarity(target_job_desc,encoded_job_descs)

    #skills and projects only compare with description
    skill_similarities = model.similarity(target_job_desc,encoded_skills)
    project_similarities = model.similarity(target_job_desc,encoded_projects)


    #put skills together with rankings
    skills_and_scores = list(zip(user_profile.skills,skill_similarities[0].tolist()))

    #select top ten most relevant skills and assigns them to profile
    skills_and_scores.sort(key=lambda x:x[1], reverse=True)
    user_profile.skills = [pair[0] for pair in skills_and_scores[0:10]]

    # we can only have 5 work experiences and projects(subject to change) so we pick 5 most relevant
    job_rankings = []
    project_rankings = []
    all_rankings = []
    #create job rankings
    for i in range(len(job_title_similarities[0])):
        #need to create new score from title and description
        t_score = job_title_similarities[0][i].item()
        d_score = job_desc_similarities[0][i].item()
        final_score = (t_score * .3) + (d_score * 0.7)
        
        job_rankings.append(final_score)
        all_rankings.append(final_score)

    #create project rankings
    for i in range(len(project_similarities[0])):
        project_rankings.append(project_similarities[0][i].item())
        all_rankings.append(project_similarities[0][i].item())

    if(len(all_rankings)> 5):
        #if less than 5, no need to do anything, user profile can remain unchanged

        #fifth score is lowest acceptable
        lowest_score = sorted(all_rankings, reverse=True)[4]

        jobs_and_scores = list(zip(user_profile.work,job_rankings))
        projects_and_scores = list(zip(user_profile.projects,project_rankings))
        user_profile.work = [job[0] for job in jobs_and_scores if job[1] >= lowest_score]
        user_profile.projects = [project[0] for project in projects_and_scores if project[1] >= lowest_score]

    return user_profile