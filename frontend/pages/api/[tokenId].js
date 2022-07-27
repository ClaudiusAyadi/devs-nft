export default function handler(req, res) {
  // get the tokenId from the queried parameter
  const tokenId = req.query.tokenId;

  // get image dir url
  const image_url =
    "https://raw.githubusercontent.com/claudiusayadi/devs-nft/tree/main/frontend/public/devsnft";

  // set Opensea standard
  res.status(200).json({
    name: "DevsNFT #" + tokenId,
    description: "It is amazing to be a builder in crypto and nft space",
    image: image_url + tokenId + ".svg",
  });
}
