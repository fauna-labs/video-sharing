export default {
	async fetch(request, env) {
	  const url = new URL(request.url);
	  const key = url.pathname.slice(1);

	  const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': '*',
    };

	  switch (request.method) {
			case 'OPTIONS':
				return new Response('OK', {
					headers: corsHeaders,
				});
			case 'PUT':
				await env.MY_BUCKET.put(key, request.body);
				return new Response(`Put ${key} successfully!`, {
					headers: corsHeaders,
				});
			case 'GET':
				const object = await env.MY_BUCKET.get(key);

				if (object === null) {
					return new Response('Object Not Found', { status: 404, headers: corsHeaders });
				}

				const headers = new Headers();
				object.writeHttpMetadata(headers);
				headers.set('etag', object.httpEtag);
				Object.assign(headers, corsHeaders);

				return new Response(object.body, {
					headers,
				});
			case 'DELETE':
				await env.MY_BUCKET.delete(key);
				return new Response('Deleted!', {
					headers: corsHeaders,
				});

			default:
				return new Response('Method Not Allowed', {
				status: 405,
				headers: {
					Allow: 'PUT, GET, DELETE, OPTIONS',
					...corsHeaders,
				},
				});
			}
	},
};
