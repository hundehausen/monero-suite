import { Accordion, NumberInput, Select, SimpleGrid, Switch, Title } from "@mantine/core";
import { LoggingSectionProps } from "./types";
import ExplainingLabel from "../../ExplainingLabel";

const LoggingSection = ({ stateFunctions, moneroNodeNoLogs }: LoggingSectionProps) => {
  const {
    moneroNodeNoLogs: nodeNoLogs,
    setMoneroNodeNoLogs,
    logLevel,
    setLogLevel,
    maxLogFileSize,
    setMaxLogFileSize,
    maxLogFiles,
    setMaxLogFiles,
  } = stateFunctions;

  return (
    <Accordion.Item value="logging">
      <Accordion.Control>
        <Title order={4}>Logging</Title>
      </Accordion.Control>
      <Accordion.Panel>
        <SimpleGrid cols={1} spacing="md">
          <Switch
            label={
              <ExplainingLabel
                label="Disable Monero Node Logging"
                explanation="When enabled, logging is completely disabled. This saves disk space but makes troubleshooting more difficult."
              />
            }
            checked={nodeNoLogs}
            onChange={(event) => setMoneroNodeNoLogs(event.currentTarget.checked)}
          />
          <Select
            label={
              <ExplainingLabel
                label="Log Level"
                explanation="Controls the verbosity of logging. 0 (default) = INFO, 1 = WARNING, 2 = DEBUG, 3 = TRACE, 4 = Everything."
              />
            }
            value={logLevel}
            onChange={(value) => value && setLogLevel(value)}
            data={[
              { value: "0", label: "0 - INFO (Default)" },
              { value: "1", label: "1 - WARNING" },
              { value: "2", label: "2 - DEBUG" },
              { value: "3", label: "3 - TRACE" },
              { value: "4", label: "4 - Everything" },
            ]}
            disabled={nodeNoLogs}
          />
          <NumberInput
            label={
              <ExplainingLabel
                label="Max Log File Size (bytes)"
                explanation="Maximum size of each log file in bytes before rotating to a new file. Default is 1048576 bytes (1MB)."
              />
            }
            value={parseInt(maxLogFileSize)}
            onChange={(value) => setMaxLogFileSize(String(value))}
            min={0}
            step={102400}
            disabled={nodeNoLogs}
          />
          <NumberInput
            label={
              <ExplainingLabel
                label="Max Log Files"
                explanation="Maximum number of log files to keep before deleting the oldest. Default is 3."
              />
            }
            value={parseInt(maxLogFiles)}
            onChange={(value) => setMaxLogFiles(String(value))}
            min={1}
            max={100}
            disabled={nodeNoLogs}
          />
        </SimpleGrid>
      </Accordion.Panel>
    </Accordion.Item>
  );
};

export default LoggingSection;
