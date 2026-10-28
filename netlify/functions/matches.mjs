export default async () => {
  const token = process.env.FOOTBALL_DATA_TOKEN;

  if (!token) {
    return new Response(
      JSON.stringify({ error: "FOOTBALL_DATA_TOKEN is missing" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const response = await fetch(
      "https://api.football-data.org/v4/matches",
      { headers: { "X-Auth-Token": token } }
    );

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { "Content-Type": "application/json" }
    });
  } catch {
    return new Response(
      JSON.stringify({ error: "Could not load matches" }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }
};
