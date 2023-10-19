import express from 'express';
import OpenAI from 'openai';

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MODEL = 'gpt-3.5-turbo';
// const MODEL = 'gpt-4';

const PROMPT = `You are an English language instructor with a specialization in TOEFL and IELTS exam preparation.
Please analyze the following student's input for English grammar errors and generate an array containing your findings. 
The array should consist of objects, each representing a distinct error. 
Each error object should have the following attributes:

- errorSegment: The exact text segment that contains the error
- startsAt: Starting from index 0, the index of the word in the student's input where the error begins (inclusive)
- endsAt: Starting from index 0, the index of the word in the student's input where the error ends (exclusive)
- explanation: A concise explanation detailing the nature of the grammatical mistake
- alternative: A recommended correction for the identified error

For example, if the user's input is 'He need to wear sun glasses', a possible result could be:
[
{
  "errorSegment": "He need",
  "startsAt": 0,
  "endsAt": 2,
  "explanation": "The verb 'need' is incorrect. Based on the Subject-Verb Agreement grammar rule: The subject and verb in a sentence must agree in number (singular or plural). It should be 'needs' to agree with the subject 'he'.",
  "alternative": "He needs"
  }
]

In case of no errors, the result should be an empty array: []
`;

router.post('/language-analyses', async (request, response, next) => {
  const { text } = request.body;

  const chatCompletion = await openai.chat.completions.create({
    messages: [
      { role: 'system', content: PROMPT },
      { role: 'user', content: `Student's input: ${text}` },
    ],
    model: MODEL,
    temperature: 0.5,
  });

  const content = chatCompletion.choices[0].message.content;

  const usage = chatCompletion.usage?.total_tokens;

  console.log(`Usage: ${usage}`);

  const analyses = JSON.parse(content!);

  response.status(200).send({ analyses });
});

export default router;
