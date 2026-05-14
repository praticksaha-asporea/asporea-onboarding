export function applyCors(req: any, res: any) {
  // console.log(req,2666);
  
  res.setHeader("Access-Control-Allow-Origin", process.env.CORS_URL);
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS,PATCH");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Optional (if using cookies)
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return true;
  }

  return false;
}