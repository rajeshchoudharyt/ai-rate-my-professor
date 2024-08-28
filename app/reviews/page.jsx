"use client";

import { getAllRecords, upsertToVectorDB } from "@/pinecone";
import { useEffect, useState } from "react";

export default function Page() {
	const [loading, setLoading] = useState(true);
	const [loadingBtn, setLoadingBtn] = useState(false);
	const [reviews, setReviews] = useState([]);
	const [feedback, setFeedback] = useState({
		professor: "",
		subject: "",
		ratings: 3,
		review: "",
	});

	useEffect(() => {
		setLoading(true);
		(async () => {
			const records = await getAllRecords();
			setReviews(records);
			setLoading(false);
		})();
	}, []);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFeedback({ ...feedback, [name]: value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		try {
			const data = feedback;
			setLoadingBtn(true);
			setFeedback({
				professor: "",
				subject: "",
				ratings: 3,
				review: "",
			});

			const response = await upsertToVectorDB(data);

			if (response && response.ok) {
				setReviews([...reviews, response.data]);
			} else alert("Error: Something went wrong.");
		} catch (error) {
			console.log(error);
		}
		setLoadingBtn(false);
	};

	return (
		<main
			className="container mx-auto min-h-[100dvh] flex flex-col justify-between gap-y-6 
						min-w-[25rem] lg:my-6 max-w-4xl p-6 sm:p-8 rounded-md shadow-md bg-white">
			<h1 className="text-xl font-bold mx-auto mt-1 tracking-wider">
				REVIEWS
			</h1>
			{loading && <div className="loading loading-spinner mx-auto" />}
			<div
				className="flex flex-col w-full overflow-y-auto min-h-[40dvh] text-sm
							divide-y-[1px] divide-base-content gap-y-4">
				{reviews.map((review) => (
					<div key={review.id} className="pt-4">
						<div className="grid grid-cols-9 sm:grid-cols-12">
							<p className="font-semibold col-span-2">
								Professor:
							</p>
							<div className="flex justify-between w-full col-span-7 sm:col-span-10">
								<p>{review.metadata.professor}</p>
								<div className="flex">
									{[1, 2, 3, 4, 5].map((i) => (
										<p
											key={i}
											className={`mask mask-star size-4 ${
												i <= review.metadata.ratings
													? "bg-base-content"
													: "bg-base-300"
											}`}
										/>
									))}
								</div>
							</div>
						</div>
						<div className="grid grid-cols-9 sm:grid-cols-12">
							<p className="font-semibold col-span-2">Subject:</p>
							<p className="col-span-7 sm:col-span-10">
								{review.metadata.subject}
							</p>
						</div>
						<div className="grid grid-cols-9 sm:grid-cols-12">
							<p className="font-semibold col-span-2">Review:</p>
							<p className="col-span-7 sm:col-span-10">
								{review.metadata.review}
							</p>
						</div>
					</div>
				))}
			</div>

			<form
				className="flex flex-col gap-y-4 w-full bg-base-200 rounded-md p-6 md:px-8"
				onSubmit={handleSubmit}>
				<div className="flex justify-between items-center">
					<h2 className="font-bold text-xl">Rate Professor</h2>
					<div className="rating">
						<input
							type="radio"
							name="ratings"
							className="mask mask-star"
							value={1}
							onChange={handleChange}
						/>
						<input
							type="radio"
							name="ratings"
							className="mask mask-star"
							value={2}
							onChange={handleChange}
						/>
						<input
							type="radio"
							name="ratings"
							className="mask mask-star"
							value={3}
							onChange={handleChange}
							defaultChecked
						/>
						<input
							type="radio"
							name="ratings"
							className="mask mask-star"
							value={4}
							onChange={handleChange}
						/>
						<input
							type="radio"
							name="ratings"
							className="mask mask-star"
							value={5}
							onChange={handleChange}
						/>
					</div>
				</div>
				<div className="flex gap-x-4">
					<input
						type="text"
						name="professor"
						className="input input-bordered h-10 text-sm rounded w-1/2"
						value={feedback.professor}
						onChange={handleChange}
						placeholder="Professor Name"
						required
					/>
					<input
						type="text"
						name="subject"
						className="input input-bordered h-10 text-sm rounded w-1/2"
						value={feedback.subject}
						onChange={handleChange}
						placeholder="Subject"
						required
					/>
				</div>
				<textarea
					name="review"
					className="textarea textarea-bordered rounded h-[3lh] resize-none"
					placeholder="Review"
					value={feedback.review}
					onChange={handleChange}
					required
				/>
				<button
					className="btn bg-base-content text-base-100 rounded w-28 mt-4 mx-auto"
					type="submit">
					{!loadingBtn ? (
						"Submit"
					) : (
						<span className="loading loading-spinner" />
					)}
				</button>
			</form>
		</main>
	);
}
