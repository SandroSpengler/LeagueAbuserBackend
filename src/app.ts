// const express = require("express");
import { Application, Request, Response, NextFunction } from "express";
import express from "express";

import { ConnectionOptions } from "tls";

import axios, { AxiosError } from "axios";

import { config } from "./Config/config";
import { SummonerRepository } from "./Repository/SummonerRepository";
import { SummonerService } from "./Services/SummonerService";
import { RiotGamesHttp } from "./Services/Http";
import { SummonerByLeagueRepository } from "./Repository/SummonerByLeagueRepository";
import { SummonerByLeagueService } from "./Services/SummonerByLeagueService";

const mongoose = require("mongoose");
const cors = require("cors");
// const cron = require("node-cron");

require("dotenv").config();

const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();

const APP: Application = express();

const summonerController = require("./Route/Api/Data/SummonerData");
const leaugeController = require("./Route/Api/Data/SummonerByLeagueData");
const matchController = require("./Route/Api/Data/Match");
const summonerRefreshController = require("./Route/Api/Refresh/SummonerRefresh");
const matchRefreshController = require("./Route/Api/Refresh/MatchRefresh");

const RGHttp = new RiotGamesHttp();

const summonerRepo = new SummonerRepository();
const summonerService = new SummonerService(summonerRepo, RGHttp);

const SbLRepo = new SummonerByLeagueRepository();
const SbLService = new SummonerByLeagueService(SbLRepo, summonerRepo, RGHttp);

let corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200, // For legacy browser support
};

APP.use(
  cors({
    origin: "*",
  }),
);

/**
 * Default entry Point for the App
 */
APP.get("/", (req: Request, res: Response) => {
  res.send("<h1>Main Page!!</h1>");
});

APP.use("/api/data/summoner", jsonParser, summonerController);
APP.use("/api/data/league", jsonParser, leaugeController);
APP.use("/api/data/match", jsonParser, matchController);
APP.use("/api/refresh/summoner", jsonParser, summonerRefreshController);
APP.use("/api/refresh/match", jsonParser, matchRefreshController);

/**
 * Connects to the MongoDB
 *
 * @param connection String used to connect to MongoDB
 */
const connectToMongoDB = async (connection: string | undefined) => {
  if (connection === undefined) {
    throw new Error("No Connection String was provided");
  }

  await mongoose
    .connect(connection, { useNewUrlParser: true, useUnifiedTopology: true } as ConnectionOptions)
    .then((data) => {
      if (process.env.NODE_ENV !== "test") {
        console.log("0. connected to mongodb");
      }
    })

    .catch((err) => {
      // console.log(err.message);
    });
};

connectToMongoDB(process.env.DB_CONNECTION);

if (process.env.NODE_ENV !== "test") {
  APP.listen(config.PORT, () => {
    console.log("0. Server is running");
  });
}
const schedule = async () => {
  try {
    // Go through all SummonerByLeague and update their MatchList
    // await checkSummonerMatchIdLists();

    const SbLChallenger = await SbLRepo.findSummonerByLeague("CHALLENGER", "RANKED_SOLO_5x5");

    if (SbLService.checkIfSummonersByLeagueCanBeUpdated(SbLChallenger)) {
      console.log("YES");
    }

    // await validateSummonerIds("CHALLENGER");
    // await validateSummonerIds("GRANDMASTER");
    // await validateSummonerIds("MASTER");

    // await validateSummonerLeague("CHALLENGER");
    // await validateSummonerLeague("GRANDMASTER");
    // await validateSummonerLeague("MASTER");

    // await checkForNewSummonerMatches("CHALLENGER");
    // await checkForNewSummonerMatches("GRANDMASTER");
    // await checkForNewSummonerMatches("MASTER");

    await setTimeout(function () {
      console.log("Going to restart");

      schedule();
    }, 1000 * 2);
  } catch (error: any) {
    console.log(error.message);
  }
};

if (process.env.RUN_JOB === "start") {
  console.log("starting");
  schedule();
}
if (process.env.RUN_JOB === "stop") {
  // console.log("0. not running any background jobs");
}

export { APP, connectToMongoDB };
