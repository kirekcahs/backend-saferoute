import Article from "../models/Article.js";

export const getAllArticles = async (req, res) => {
  try {
    const articles = await Article.find({});
    res.status(200).json({ message: "OK", articles });
  } catch (err) {
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

export const createArticle = async (req, res) => {
  try {
    const { title, photoUrl, description, sourceLink } = req.body;
    const newArticle = await Article.create({
      title,
      photoUrl,
      description,
      sourceLink,
    });

    res.status(201).json({
      message: "Article added successfully.",
      article: newArticle,
    });
  } catch (err) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const deleteSingleArticle = async (req, res) => {
  const { id } = req.query;

  try {
    const article = await Article.findByIdAndDelete(id);

    if (!article) {
      return res
        .status(400)
        .json({ code: 404, message: "Article nnot found." });
    }
    return res
      .status(200)
      .json({ code: 200, message: "Article deleted successfully." });
  } catch (err) {
    return res.json({ code: 500, message: "Internal Server Error." });
  }
};

export const deleteAllArticle = async (req, res) => {
  try {
    const articles = await Article.deleteMany({});
    return res
      .status(200)
      .json({ code: 200, message: "Successfully deleted all articles." });
  } catch (err) {
    return res.status(500).json({code: 500, message: "Internal Server Error."})
  }
};
