import Groq from "groq-sdk";

import { NextResponse } from "next/server";
import { generateEmbeddings, similaritySearch } from "@/pinecone";

const groq = new Groq();

const options = {
	model: process.env.MODEL_ID || "llama3-8b-8192",
	temperature: 0.5,
	max_tokens: 1024,
	top_p: 1,
	stop: null,
	stream: true,
};

const systemPrompt = `
Welcome to Rate My Professor!
I'm here to help you find the best professors at [University Name] based on your specific needs and preferences. Please ask me a question about a professor or a department, and I'll provide you with the top 3 recommendations based on our database of professor ratings.

Example queries:
1. Best professors for computer science majors
2. Top-rated professors for intro psychology courses
3. Professors with high ratings for research opportunities in biology
4. Best professors for students with learning disabilities
5. Professors with flexible office hours

How to ask your question:
1. Use simple language and avoid jargon.
2. Provide specific details about the professor or department you're interested in (e.g., course, major, department).
3. If you have specific preferences (e.g., research opportunities, teaching style), let me know!

Your query:
Please type your question or ask a question about a professor or department. I'll respond with the top 3 recommendations based on our database of professor ratings.

Let's get started! What's your question?
`;

export async function POST(req, res) {
	const data = await req.json();

	const lastMessageContent = data[data.length - 1].content;
	try {
		const embeddings = await generateEmbeddings([lastMessageContent]);

		const results = await similaritySearch(embeddings[0].values);

		let resultString =
			"Below are the returned results from vector db (done automatically):";
		results.matches.forEach((record) => {
			resultString += `\n
            Professor: ${record.metadata.professor}
            Subject: ${record.metadata.subject}
            Ratings: ${record.metadata.ratings}
            Reviews: ${record.metadata.review}
            \n`;
		});

		const completion = await groq.chat.completions.create({
			messages: [
				{ role: "system", content: systemPrompt },
				...data.slice(0, data.length - 1),
				{ role: "user", content: lastMessageContent + resultString },
			],
			...options,
		});

		const stream = new ReadableStream({
			async start(controller) {
				const encoder = new TextEncoder();
				try {
					for await (let chunk of completion) {
						const content = chunk.choices[0]?.delta?.content || "";
						if (content) {
							controller.enqueue(encoder.encode(content));
						}
					}
				} catch (err) {
					controller.error(err);
				} finally {
					controller.close();
				}
			},
		});

		return new NextResponse(stream);
		//
	} catch (error) {
		console.log(error);
		return NextResponse.json({ error }, { status: 400 });
	}
}
