const friendlyTexts: Array<{ pattern: RegExp; message: string }> = [
  { pattern: /insufficient funds/i, message: '余额不足，请先在当前网络为钱包充值' },
  { pattern: /User rejected the request/i, message: '您已拒绝了这些请求' },
  { pattern: /请先安装/i, message: '您还没有安装 Web3 钱包' },
  { pattern: /user rejected/i, message: '您已取消交易签名' },
  { pattern: /denied transaction signature/i, message: '您已拒绝签名，请重新尝试' },
  { pattern: /nonce/i, message: '交易顺序异常，请刷新页面后重试' },
  { pattern: /network error/i, message: '网络连接异常，请检查 RPC 或网络设置' },
  { pattern: /execution reverted/i, message: '合约执行被拒绝，请检查输入参数' },
];

const extractErrorMessage = (error: unknown): string | undefined => {
  if (!error) {
    return undefined;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'object') {
    const maybeMessage =
      (error as { message?: string }).message ||
      (error as { data?: { message?: string } }).data?.message ||
      (error as { error?: { message?: string } }).error?.message;

    if (maybeMessage) {
      return maybeMessage;
    }
  }

  return undefined;
};

export const getFriendlyError = (error: unknown, fallback = '操作失败，请稍后重试') => {
  const rawMessage = extractErrorMessage(error);
  if (!rawMessage) {
    return fallback;
  }

  for (const { pattern, message } of friendlyTexts) {
    if (pattern.test(rawMessage)) {
      return message;
    }
  }

  return fallback;
};
