import express from "express";
import { getRepoDetails } from "../controllers/repo.controller.js";

const router = express.Router();

router.get("/:owner/:repo", getRepoDetails);

export default router;
