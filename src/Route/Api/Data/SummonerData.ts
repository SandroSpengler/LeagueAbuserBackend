const express = require("express");
const router = express.Router();

import { getSummonerByName } from "../../../Services/Http";

router.get("/:name", async (req, res) => {
  if (req.params.name) {
    try {
      const summoner = await getSummonerByName(req.params.name);

      res.status(200).json({
        success: true,
        result: summoner.data,
      });
    } catch (error) {
      res.status(500);
      res.send("Error");
    }
  }
});

router.post("/", async (req, res) => {});

module.exports = router;