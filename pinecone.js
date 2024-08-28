// Startup file - never run this file more than once

"use server";

import { Pinecone } from "@pinecone-database/pinecone";
import jsonData from "./reviews.json" assert { type: "json" };

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

const indexName = "rate-my-professor";
const namespace = "reviews";
const index = pc.index(indexName);

// update();

async function update() {
	try {
		// Step 1: Create index
		await createIndex(indexName);

		// Step 2: Generate embeddings for the doc data
		const embeddingInputData = jsonData.reviews.map((obj) => obj.review);
		const embeddings = await generateEmbeddings(embeddingInputData);

		// Step 3: Restructure the data to embed
		const data = restructure(embeddings, jsonData);

		// Step 4: Upsert or add the restructured embeddings to pinecone namespace "reviews" inside index "rate-my-professor"
		await upsert(data);

		// To check the stats of the upserted data
		await index.describeIndexStats();
		//
	} catch (error) {
		throw new Error(error);
	}
}

// Create new index with name "rate-my-professor" with 1024 embedding dimension
async function createIndex(name) {
	try {
		await pc.createIndex({
			name,
			dimension: 1024,
			metric: "cosine",
			spec: {
				serverless: {
					cloud: "aws",
					region: "us-east-1",
				},
			},
		});
		//
	} catch (error) {
		throw new Error("Error creating index:", error);
	}
}

// Upsert data
async function upsert(data) {
	return await index.namespace(namespace).upsert(data);
}

// Process or structure the data for embedding
function restructure(embeddings, data) {
	const processedData = embeddings.map((embedding, i) => {
		return {
			id: i.toString(), // str
			values: embedding.values,
			metadata: {
				professor: data.reviews[i].professor,
				subject: data.reviews[i].subject,
				ratings: data.reviews[i].ratings,
				review: data.reviews[i].review,
			},
		};
	});

	return processedData;
}

// Generate embeddings
async function generateEmbeddings(data) {
	try {
		const model = "multilingual-e5-large";
		const embeddings = await pc.inference.embed(model, data, {
			inputType: "passage",
			truncate: "END",
		});

		return embeddings.data;
		//
	} catch (error) {
		throw new Error("Error generating embeddings:", error);
	}
}

// To fetch all records
async function getAllRecords() {
	try {
		const stats = await index.describeIndexStats();
		const count = stats.namespaces[namespace].recordCount;

		let ids = [];
		for (let i = 0; i < count; i++) ids.push(i.toString());

		const result = await index.namespace(namespace).fetch(ids);

		let records = Object.values(result.records).map((record) => {
			return {
				id: record.id,
				metadata: record.metadata,
			};
		});

		return records;
		//
	} catch (error) {
		throw new Error("Failed to fetch records:", error);
	}
}

// Cosine query
async function similaritySearch(vector) {
	try {
		return await index.namespace(namespace).query({
			topK: 3,
			vector,
			includeValues: false,
			includeMetadata: true,
		});
		//
	} catch (error) {
		throw new Error("Similarity search error:", error);
	}
}

async function upsertToVectorDB(data) {
	try {
		const stats = await index.describeIndexStats();
		const id = stats.namespaces[namespace].recordCount;

		const embeddingInputData = [data.review];
		const embeddings = await generateEmbeddings(embeddingInputData);

		const processedData = [
			{
				id: id.toString(), // str
				values: embeddings[0].values,
				metadata: data,
			},
		];

		await upsert(processedData);

		return { ok: true, data: { ...processedData[0], values: null } };
		//
	} catch (error) {
		throw new Error("Error upserting to vector DB:", error);
	}
}

export {
	generateEmbeddings,
	getAllRecords,
	similaritySearch,
	upsertToVectorDB,
};
