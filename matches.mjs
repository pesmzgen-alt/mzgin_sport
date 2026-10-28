export default async (request) => {
  const token = Netlify.env.get("FOOTBALL_DATA_TOKEN");
  if (!token) {
    return Response.json({ error: "FOOTBALL_DATA_TOKEN is not set" }, { status: 500 });
  }
  const url = new URL(request.url);
  const date = url.searchParams.get("date");
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return Response.json({ error: "Invalid or missing date" }, { status: 400 });
  }
  const endpoint = `https://api.football-data.org/v4/matches?dateFrom=${date}&dateTo=${date}`;
  try {
    const upstream = await fetch(endpoint, { headers: { "X-Auth-Token": token } });
    const body = await upstream.json();
    if (!upstream.ok) {
      return Response.json({ error: body.message || `Football API returned ${upstream.status}` }, { status: upstream.status });
    }
    return Response.json({ date, matches: body.matches || [] }, {
      headers: { "Cache-Control": "public, max-age=30" }
    });
  } catch {
    return Response.json({ error: "Could not reach football-data.org" }, { status: 502 });
  }
};
