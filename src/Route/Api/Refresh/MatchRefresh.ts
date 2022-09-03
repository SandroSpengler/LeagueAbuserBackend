import { AxiosError } from "axios";
import { Request, Response } from "express";
import { MatchRepository } from "../../../Repository/MatchRepository";
import { SummonerRepository } from "../../../Repository/SummonerRepository";
import { DataMiningService } from "../../../Services/DataMiningService";
import { RiotGamesHttp } from "../../../Services/Http";
import { MatchService } from "../../../Services/MatchService";
import { SummonerService } from "../../../Services/SummonerService";

const express = require("express");
const router = express.Router();

export class MatchRefreshRoute {
  private RGHttp = new RiotGamesHttp();

  private summonerRepo: SummonerRepository = new SummonerRepository();
  private summonerService: SummonerService = new SummonerService(this.summonerRepo, this.RGHttp);

  private matchRepo = new MatchRepository();
  private matchService = new MatchService(this.matchRepo, this.RGHttp);

  private dataMinginService = new DataMiningService(this.summonerRepo, this.RGHttp, this.matchRepo, this.matchService);

  constructor() {
    router.put("/:summonerId", this.putMatchSummonerId);
  }

  public putMatchSummonerId = async (req: Request, res: Response) => {
    const summonerId = req.params.summonerId;

    if (summonerId === undefined || summonerId === "") {
      return res.status(400).send();
    }

    const summonerInDB = await this.summonerRepo.findSummonerByID(summonerId);

    if (summonerInDB === null) {
      return res.status(404).send();
    }

    try {
      if (!this.summonerService.checkIfSummonerMatchesCanBeUpdated(summonerInDB)) {
        return res.status(409).send();
      }

      await this.dataMinginService.addNewMatchesToSummoner(summonerInDB);

      const updatedSummoner = await this.summonerRepo.findSummonerByID(summonerId);

      return res.status(200).json(updatedSummoner);
    } catch (error: any) {
      let axiosError: AxiosError = error;

      if (axiosError.response?.status === 404) {
        return res.status(404).send();
      }

      if (axiosError.response?.status === 429) {
        return res.status(429).send();
      }
    }

    return res.status(500).send();
  };
}

new MatchRefreshRoute();

module.exports = router;
