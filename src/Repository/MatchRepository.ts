import * as mongoose from "mongoose";

import { MatchData, Participant } from "../Models/Interfaces/MatchData";

import Summoner from "../Models/Interfaces/Summoner";
import MatchSchema from "../Models/Schemas/MatchSchema";
import { updateSummonerByPUUID } from "./SummonerRepository";

export const findAllMachtes = async (): Promise<MatchData[] | null> => {
  let allMatches: MatchData[] | null;
  try {
    allMatches = await MatchSchema.find().lean();

    return allMatches;
  } catch (error) {}

  return null;
};

export const findMatchById = async (matchId: string): Promise<MatchData[] | null> => {
  let matchById: MatchData[] | null;
  try {
    matchById = await MatchSchema.find({ _id: matchId }).lean();

    return matchById;
  } catch (error) {
    return null;
  }
};

export const findAllMatchesBySummonerPUUID = async (summonerPUUID: string): Promise<MatchData[] | null> => {
  let matchesById: MatchData[] | null;
  try {
    matchesById = await MatchSchema.find({})
      // .find({
      //   "metadata.participants": {
      //     $in: ["wNmqP7H1ywT7s9VV-i6gMaaUD9d6ugPuqmf2U6wOHdPpFCBdwDkc29cfhVltttRRVwUbwvI0yz4AnQ"],
      //   },
      // })
      .where("metadata.participants")
      .in([summonerPUUID])
      // .all(["wNmqP7H1ywT7s9VV-i6gMaaUD9d6ugPuqmf2U6wOHdPpFCBdwDkc29cfhVltttRRVwUbwvI0yz4AnQ"])
      .lean();

    //  .in([String]) or {$in:[String]}
    // ONE of the values inside that array has to be present

    //  .all([String]) or {$all:[String]}
    // ALL of the values inside that array has to be present

    // .all([String]) === .in([String]) BUT .all([String,String]) !== .in([String,String])

    return matchesById;
  } catch (error) {
    throw error;
  }
};

export const createMatchWithSummonerInformation = async (
  match: MatchData,
  summonerPUUID,
  summonerId: string
): Promise<MatchData | null> => {
  try {
    let tmpMatch = new MatchSchema();

    tmpMatch._id = match.metadata.matchId;
    tmpMatch.metadata = match.metadata;
    tmpMatch.info = match.info;

    await tmpMatch.save();
  } catch (error) {
    throw error;
  }

  return null;
};

export const updateMatch = async (match: MatchData): Promise<MatchData | null> => {
  let matchById: MatchData | null;
  try {
    await MatchSchema.updateOne({ _id: match._id }, match).exec();
  } catch (error) {
    throw error;
  }

  return null;
};

export const addMatchesForSummonerPUUID = async (match: MatchData) => {
  // Maybe
  // Check what matches are already in DB

  try {
  } catch (error) {
    throw error;
  }

  return null;
};

export const checkSummonerMatchesForEloInflation = async (summoner: Summoner) => {
  try {
    let summonerMatches: MatchData[] | null = await findAllMatchesBySummonerPUUID(summoner.puuid);

    if (summonerMatches === null) return;

    let exhaustCount: number = 0;
    let exhaustCastCount: number = 0;
    let tabisCount: number = 0;
    let zhonaysCount: number = 0;

    if (summonerMatches === undefined) return;

    let matchesForSummonerPUUID: Participant[] = [];

    for (const [index, match] of summonerMatches.entries()) {
      let summonerMatch: Participant | undefined = match.info[0].participants.find((participant) => {
        return participant.puuid === summoner?.puuid;
      });

      if (summonerMatch === undefined) {
        continue;
      }

      matchesForSummonerPUUID.push(summonerMatch);
    }

    matchesForSummonerPUUID.forEach((participant: Participant) => {
      if (participant?.summoner1Id === 3) {
        // summonerMatchDetails.exhaustAbused = true;

        exhaustCount += 1;
        exhaustCastCount += participant.summoner1Casts;
      }

      if (participant?.summoner2Id === 3) {
        // summonerMatchDetails.exhaustAbused = true;

        exhaustCount += 1;
        exhaustCastCount += participant.summoner2Casts;
      }

      // Items === Tabis (Id: 3047)
      // Items === Zhonay's (Id: 3157)

      if (participant?.item0 === 3047) {
        tabisCount += 1;
      }
      if (participant?.item0 === 3157) {
        zhonaysCount += 1;
      }

      if (participant?.item1 === 3047) {
        tabisCount += 1;
      }
      if (participant?.item1 === 3157) {
        zhonaysCount += 1;
      }

      if (participant?.item2 === 3047) {
        tabisCount += 1;
      }
      if (participant?.item2 === 3157) {
        zhonaysCount += 1;
      }

      if (participant?.item3 === 3047) {
        tabisCount += 1;
      }
      if (participant?.item3 === 3157) {
        zhonaysCount += 1;
      }

      if (participant?.item4 === 3047) {
        tabisCount += 1;
      }
      if (participant?.item4 === 3157) {
        zhonaysCount += 1;
      }

      if (participant?.item5 === 3047) {
        tabisCount += 1;
      }
      if (participant?.item5 === 3157) {
        zhonaysCount += 1;
      }

      if (participant?.item6 === 3047) {
        tabisCount += 1;
      }
      if (participant?.item6 === 3157) {
        zhonaysCount += 1;
      }
    });

    summoner.exhaustCount = exhaustCount;
    summoner.exhaustCastCount = exhaustCastCount;
    summoner.tabisCount = tabisCount;
    summoner.zhonaysCount = zhonaysCount;

    await updateSummonerByPUUID(summoner);

    // await setexhaustCount(exhaustCount);
    // await setexhastCastedCount(exhaustUsedCount);
    // await setTabisCount(tabisCount);
    // await setzhonaysCount(zhonaysCount);
  } catch (error) {}
};
