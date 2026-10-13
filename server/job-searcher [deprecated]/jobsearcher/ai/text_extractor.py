from dotenv import load_dotenv
from pathlib import Path
# import prompt # for running separately
from . import prompt
import json
# import google.generativeai as genai
from google import genai
from google.genai import types
# from pydantic import BaseModel
import os

dotenv_path = Path(__file__).resolve().parent.parent.parent.parent / '.env'
load_dotenv(dotenv_path)

def text_extractor(job_post):
    model='gemini-2.5-flash'
    client  = genai.Client(api_key=os.getenv('GENAI_API_KEY'))

    # Load schema
    model_json_path = Path(__file__).resolve().parent / 'model.json'
    with open(model_json_path, 'r') as f:
        schema = json.load(f)

    # config
    system_prompt = prompt.system_prompt
    user_prompt = prompt.get_user_prompt(job_post)

    response = client.models.generate_content(
        model=model,
        contents=user_prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_json_schema=schema,
            system_instruction=system_prompt
        ),
    )

    try:
        data = json.loads(response.text)
        return data
    except json.JSONDecodeError:
        print("Error: Failed to decode JSON from the response.")
        print("Raw Response Text:", response.text)
        return response.text

