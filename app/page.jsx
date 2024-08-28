"use client";

import { useState, useEffect, useRef } from "react";

export default function Home() {
	const [loading, setLoading] = useState(false);
	const [messages, setMessages] = useState([
		{
			role: "assistant",
			content:
				"Hey! I'm the Rate My Professor support assistant. How can I help you today?",
		},
	]);
	const [message, setMessage] = useState("");
	const ref = useRef();

	useEffect(() => {
		if (ref.current) {
			ref.current.lastChild.scrollIntoView({ behavior: "smooth" });
		}
	}, [messages]);

	const handleSend = async (e) => {
		e.preventDefault();
		if (message.trim() === "") return;

		const userMessage = { role: "user", content: message };
		setMessages((prev) => [...prev, userMessage]);
		setMessage("");

		try {
			setLoading(true);
			const response = await fetch("api/chat", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify([...messages, userMessage]),
			});
			setLoading(false);

			if (!response.ok) {
				throw new Error("Failed to fetch response");
			}

			if (!response.body) {
				throw new Error("No response body");
			}

			const reader = response.body.getReader();
			const decoder = new TextDecoder();

			let botMessage = { role: "assistant", content: "" };
			setMessages((prev) => [...prev, botMessage]);

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				const chunk = decoder.decode(value);
				botMessage.content += chunk;
				setMessages((prev) => [
					...prev.slice(0, prev.length - 1),
					{ ...botMessage },
				]);
			}
		} catch (error) {
			const errorMessage = {
				role: "assistant",
				content: "Sorry, I encountered an error. Please try again.",
			};

			setLoading(false);
			setMessages((prev) => [...prev, errorMessage]);
		}
	};

	return (
		<main
			className="container mx-auto h-full min-h-[100dvh] lg:min-h-[94dvh] space-y-2 max-w-4xl 
						lg:my-6 p-4 lg:rounded-md shadow-md bg-white text-sm lg:text-base">
			<div
				className="w-full pt-10 lg:pt-0 overflow-y-auto h-[88dvh] min-h-[88dvh] 
							md:min-h-[85dvh] lg:min-h-[78dvh]"
				ref={ref}>
				{messages.map((message, key) => (
					<p
						key={key}
						className={`m-2 py-2 px-4 rounded whitespace-pre-line w-fit max-w-[90%]
									${
										message.role === "user"
											? "ml-auto bg-base-content text-base-100"
											: "bg-base-200"
									}`}>
						{message.content}
					</p>
				))}
				<p className="text-center">
					{loading && <span className="loading loading-spinner" />}
				</p>
			</div>
			<form
				className="flex space-x-2 w-full h-full"
				onSubmit={handleSend}>
				<input
					type="text"
					className="input input-bordered rounded text-sm w-full"
					value={message}
					onChange={(e) => setMessage(e.target.value)}
					required
					placeholder="Start typing..."
				/>
				<button
					className="btn bg-base-content text-base-100 rounded"
					type="submit">
					Send
				</button>
			</form>
		</main>
	);
}
