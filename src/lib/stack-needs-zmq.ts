import { p2poolModes, type P2PoolMode } from "@/hooks/services/types";

/** True when monerod must bind ZMQ pub (and must not pass --no-zmq). */
export function stackNeedsZmq(
  p2PoolMode: P2PoolMode,
  isMonitoring: boolean,
  isMoneroLws: boolean
): boolean {
  return p2PoolMode !== p2poolModes.none || isMonitoring || isMoneroLws;
}
