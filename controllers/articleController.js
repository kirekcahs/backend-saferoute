import Article from "../models/Article.js";
import { bucket } from "../config/gcs.js";

export const getAllArticles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const [articles, totalArticles] = await Promise.all([
      Article.find({}).skip(skip).limit(limit),
      Article.countDocuments(),
    ]);

    const totalPages = Math.ceil(totalArticles / limit);

    res.status(200).json({
      message: "OK",
      pagination: {
        totalArticles,
        totalPages,
        currentPage: page,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      articles,
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

export const createArticle = async (req, res) => {
  // 1. Extract exactly what your schema expects from the request body
  const { title, description, sourceLink } = req.body || {};

  // 2. Validate the required fields based on your schema
  if (!title || !description || !req.file) {
    return res.status(400).json({
      error: "Data missing. Ensure title, description, and an image are provided.",
    });
  }

  try {
    // 3. Setup the file metadata for GCS
    const safeName = req.file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const fileName = `articles/${Date.now()}_${safeName}`; 
    const blob = bucket.file(fileName);
    const blobStream = blob.createWriteStream({
      resumable: false,
      metadata: { contentType: req.file.mimetype },
    });

    // 4. Handle upload errors
    blobStream.on("error", (err) => {
      return res.status(500).json({ error: err.message });
    });

    // 5. Execute when the upload successfully finishes
    blobStream.on("finish", async () => {
      // Generate the public Firebase Storage URL
      const encodedFileName = encodeURIComponent(blob.name);
      const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodedFileName}?alt=media`;

      try {
        // Create the Article using your exact schema fields
        const article = await Article.create({
          title,
          description,
          sourceLink: sourceLink || null, // Optional field
          photoUrl: publicUrl, // Matches your schema's photoUrl field
        });

        // Send success response
        return res.status(201).json({
          message: "Article created successfully",
          article,
        });
      } catch (dbError) {
        // Catch any Mongoose validation errors
        return res.status(500).json({ error: dbError.message });
      }
    });

    // 6. Start the upload
    blobStream.end(req.file.buffer);

  } catch (err) {
    return res.status(500).json({ error: err.message });
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
