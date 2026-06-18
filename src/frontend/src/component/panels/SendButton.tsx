import styled from "styled-components";

const SendButton = styled.button`
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 600;
  border: none;
  border-radius: var(--radius);
  padding: 6px 14px;
  width: auto;
  cursor: pointer;
  background: var(--twitch);
  color: #fff;
  transition: background 0.15s, transform 0.1s;

  &:hover {
    background: var(--twitch-hover);
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

export default SendButton;