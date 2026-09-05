import { useQueryState, parseAsBoolean, parseAsStringEnum } from "nuqs";
import {
  watchtowerUpdateFrequencies,
  WatchtowerUpdateFrequency,
  watchtowerCooldownDelays,
  WatchtowerCooldownDelay,
} from "./types";

export const useWatchtowerService = () => {
  const [isWatchtower, setIsWatchtower] = useQueryState(
    "isWatchtower",
    parseAsBoolean.withDefault(false)
  );
  const [watchtowerUpdateFrequency, setWatchtowerUpdateFrequency] =
    useQueryState<WatchtowerUpdateFrequency>(
      "watchtowerUpdateFrequency",
      parseAsStringEnum(Object.values(watchtowerUpdateFrequencies)).withDefault(
        watchtowerUpdateFrequencies.hourly
      )
    );
  const [watchtowerCooldownDelay, setWatchtowerCooldownDelay] =
    useQueryState<WatchtowerCooldownDelay>(
      "watchtowerCooldownDelay",
      parseAsStringEnum(Object.values(watchtowerCooldownDelays)).withDefault(
        watchtowerCooldownDelays["24h"]
      )
    );

  return {
    stateFunctions: {
      isWatchtower,
      setIsWatchtower,
      watchtowerUpdateFrequency,
      setWatchtowerUpdateFrequency,
      watchtowerCooldownDelay,
      setWatchtowerCooldownDelay,
    },
  };
};
