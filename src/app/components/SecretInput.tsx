"use client";

import {
  ActionIcon,
  CopyButton,
  PasswordInput,
  Tooltip,
  rem,
} from "@mantine/core";
import { TbCheck, TbCopy } from "react-icons/tb";
import ExplainingLabel from "./ExplainingLabel";

type SecretInputProps = {
  label: string;
  explanation: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string | null;
};

const SecretInput = ({
  label,
  explanation,
  value,
  onChange,
  placeholder,
  error,
}: SecretInputProps) => (
  <PasswordInput
    w="100%"
    label={<ExplainingLabel label={label} explanation={explanation} />}
    value={value}
    onChange={(event) => onChange(event.currentTarget.value)}
    placeholder={placeholder}
    error={error ?? undefined}
    autoComplete="off"
    leftSection={
      <CopyButton value={value} timeout={2000}>
        {({ copied, copy }) => (
          <Tooltip label={copied ? "Copied" : "Copy"} withArrow>
            <ActionIcon
              variant="subtle"
              size="sm"
              onClick={copy}
              disabled={!value}
              aria-label={`Copy ${label}`}
            >
              {copied ? (
                <TbCheck style={{ width: rem(16) }} />
              ) : (
                <TbCopy style={{ width: rem(16) }} />
              )}
            </ActionIcon>
          </Tooltip>
        )}
      </CopyButton>
    }
    leftSectionPointerEvents="all"
  />
);

export default SecretInput;
