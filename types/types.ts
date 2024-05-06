export type OpenAIModel = 'gpt-3.5-turbo' | 'gpt-4-1106-preview';

export interface TranslateBody {
  inputLanguage: string;
  outputLanguage: string;
  inputCode: string;
  model: OpenAIModel;
  apiKey: string;
  baseUrl: string
}

export interface TranslateResponse {
  code: string;
}
