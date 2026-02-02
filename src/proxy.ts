/*
Important:
	This proxy manager is not complete. It only returns the response of the first matched proxy and ends the chain.
*/


import { NextResponse, NextRequest } from 'next/server';
import { match, MatchFunction } from 'path-to-regexp';
import { proxies } from './proxies';


const matchCache = new Map<string, MatchFunction<object>>();
function getCachedMatchFunction(pattern: string): MatchFunction<object> {
	if (matchCache.has(pattern)) {
		return matchCache.get(pattern)!;
	}

	const newMatchFn = match(pattern, { decode: decodeURIComponent });
	matchCache.set(pattern, newMatchFn);
	return newMatchFn;
}

export async function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl;
	const currentRequest = request;

	for (const p of proxies) {
		const { matcher } = p.config;
		let doesMatch = false;

		// Use our new, high-performance cached function
		if (Array.isArray(matcher)) {
			doesMatch = matcher.some((pattern) => getCachedMatchFunction(pattern)(pathname));
		} else {
			doesMatch = !!getCachedMatchFunction(matcher)(pathname);
		}

		if (doesMatch) {
			const response = await p.proxy(currentRequest);

			// if (response.headers.get('x-middleware-rewrite') || response.headers.get('Location')) {
			// 	return response;
			// }

			// if (response.headers.get('x-middleware-next')) {
			// 	const newHeaders = new Headers(currentRequest.headers);
			// 	response.headers.forEach((value, key) => {
			// 		if (key.startsWith('x-middleware-request-')) {
			// 			const headerKey = key.substring('x-middleware-request-'.length);
			// 			newHeaders.set(headerKey, value);
			// 		}
			// 	});

			// 	// Create the new request object for the next iteration.
			// 	currentRequest = new NextRequest(currentRequest.nextUrl, {
			// 		headers: newHeaders,
			// 	});
			// 	continue;
			// }

			return response;
		}
	}

	return NextResponse.next();
}


// Optional: A global matcher to exclude assets and other non-page requests
// from any proxy processing, for performance.
export const config = {
	matcher: [
		'/((?!_next/static|_next/image|favicon.ico).*)',
	],
};