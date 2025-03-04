import { ServiceComponentProps } from "../types";

export interface MoneroNodeSectionProps extends ServiceComponentProps {}

export interface SectionProps {
  stateFunctions: any;
  moneroNodeNoLogs?: boolean;
}

export interface LoggingSectionProps extends SectionProps {}
export interface StorageSectionProps extends SectionProps {
  isPrunedNode: boolean;
}
export interface NetworkSecuritySectionProps extends SectionProps {}
export interface NodeConnectionsSectionProps extends SectionProps {}
export interface P2PNetworkSectionProps extends SectionProps {}
export interface TorI2PSectionProps extends SectionProps {}
export interface PerformanceSectionProps extends SectionProps {}
export interface BootstrapNodeSectionProps extends SectionProps {
  bootstrapDaemonAddress: string;
}
export interface RpcZmqSectionProps extends SectionProps {
  zmqPubEnabled: boolean;
}
export interface NotificationsSectionProps extends SectionProps {}
export interface MiningSectionProps extends SectionProps {
  startMining: string;
  bgMiningEnable: boolean;
}

export interface AdvancedConfigModalProps {
  opened: boolean;
  onClose: () => void;
  stateFunctions: any;
}
