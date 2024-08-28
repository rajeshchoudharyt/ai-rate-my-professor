"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
	const path = usePathname();

	return (
		<nav className="w-full fixed top-0 flex justify-end items-center z-10">
			<div className="dropdown dropdown-end">
				<div
					tabIndex={0}
					role="button"
					className="btn m-2 px-3 rounded bg-base-content">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						className="size-6 fill-base-100">
						<path
							fillRule="evenodd"
							d="M3 6.75A.75.75 0 0 1 3.75 6h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 6.75ZM3 12a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 12Zm0 5.25a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75Z"
							clipRule="evenodd"
						/>
					</svg>
				</div>
				<ul
					tabIndex={0}
					className="dropdown-content menu bg-base-100 rounded z-10 mr-2 w-52 p-2 space-y-2 shadow">
					<li>
						<Link
							className={`rounded ${
								path === "/reviews"
									? "text-base-200 bg-base-content hover:bg-base-content focus:bg-base-content visited:text-base-200"
									: ""
							}`}
							href="/reviews">
							Reviews
						</Link>
					</li>
					<li>
						<Link
							className={`rounded ${
								path === "/"
									? "text-base-200 bg-base-content hover:bg-base-content focus:bg-base-content visited:text-base-200"
									: ""
							}`}
							href="/">
							Assistant
						</Link>
					</li>
				</ul>
			</div>
		</nav>
	);
}
