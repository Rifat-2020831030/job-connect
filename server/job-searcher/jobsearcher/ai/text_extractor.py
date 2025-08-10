from dotenv import load_dotenv
from pathlib import Path
from . import prompt
import json
import google.generativeai as genai
import os

dotenv_path = Path(__file__).resolve().parent.parent.parent / '.env'
load_dotenv(dotenv_path)
genai.configure(api_key=os.environ["GEMINI_API_KEY"]) 

def text_extractor(job_post):
    model='gemini-2.5-flash'

    # Load schema
    model_json_path = Path(__file__).resolve().parent / 'model.json'
    with open(model_json_path, 'r') as f:
        schema = json.load(f)

    generation_config = genai.GenerationConfig(
        temperature=0.3,
        response_mime_type="application/json",
        response_schema=schema
    )

    # config
    system_prompt = prompt.system_prompt
    user_prompt = prompt.get_user_prompt(job_post)

    model = genai.GenerativeModel(
        model_name=model,
        generation_config=generation_config,
        system_instruction=system_prompt,
    )

    response = model.generate_content(user_prompt)

    try:
        data = json.loads(response.text)
        return data
    except json.JSONDecodeError:
        print("Error: Failed to decode JSON from the response.")
        print("Raw Response Text:", response.text)
        return response.text

