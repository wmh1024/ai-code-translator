import {APIKeyInput} from '@/components/APIKeyInput';
import {CodeBlock} from '@/components/CodeBlock';
import {LanguageSelect} from '@/components/LanguageSelect';
import {ModelSelect} from '@/components/ModelSelect';
import {TextBlock} from '@/components/TextBlock';
import {OpenAIModel, TranslateBody} from '@/types/types';
import Head from 'next/head';
import {useEffect, useState} from 'react';
import {BaseUrlInput} from "@/components/BaseUrlInput";

export default function Home() {
  const [inputLanguage, setInputLanguage] = useState<string>('JavaScript');
  const [outputLanguage, setOutputLanguage] = useState<string>('Python');
  const [inputCode, setInputCode] = useState<string>('');
  const [outputCode, setOutputCode] = useState<string>('');
  const [model, setModel] = useState<OpenAIModel>('gpt-3.5-turbo');
  const [loading, setLoading] = useState<boolean>(false);
  const [hasTranslated, setHasTranslated] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string>('');
  const [baseUrl, setBaseUrl] = useState<string>('https://ai.wmhwiki.cn/api');

  const handleTranslate = async () => {
    const maxCodeLength = model === 'gpt-3.5-turbo' ? 6000 : 12000;

    if (!apiKey) {
      alert('请输入 API key。');
      return;
    }

    if (inputLanguage === outputLanguage) {
      alert('请选择不同的语言！');
      return;
    }

    if (!inputCode) {
      alert('输入不能为空。');
      return;
    }

    if (inputCode.length > maxCodeLength) {
      alert(
        `请输入少于 ${maxCodeLength} 个字符的代码。您当前已输入 ${inputCode.length} 个字符。`
      );
      return;
    }

    setLoading(true);
    setOutputCode('');

    const controller = new AbortController();

    const body: TranslateBody = {
      inputLanguage,
      outputLanguage,
      inputCode,
      model,
      apiKey,
      baseUrl
    };

    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      setLoading(false);
      alert('Something went wrong.');
      return;
    }

    const data = response.body;

    if (!data) {
      setLoading(false);
      alert('Something went wrong.');
      return;
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;
    let code = '';

    while (!done) {
      const {value, done: doneReading} = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);

      code += chunkValue;

      setOutputCode((prevCode) => prevCode + chunkValue);
    }

    setLoading(false);
    setHasTranslated(true);
    copyToClipboard(code);
  };

  const copyToClipboard = (text: string) => {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  };

  const handleApiKeyChange = (value: string) => {
    setApiKey(value);
    localStorage.setItem('apiKey', value);
  };

  const handleBaseUrlChange = (value: string) => {
    setBaseUrl(value);
    localStorage.setItem('baseurl', value);
  };

  useEffect(() => {
    if (hasTranslated) {
      handleTranslate();
    }
  }, [outputLanguage]);

  useEffect(() => {
    const apiKey = localStorage.getItem('apiKey');

    if (apiKey) {
      setApiKey(apiKey);
    }
  }, []);

  return (
    <>
      <Head>
        <title>代码转译器 | Code Translator</title>
        <meta
          name="description"
          content="Use AI to translate code from one language to another."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <link rel="icon" href="/favicon.ico"/>
      </Head>
      <div className="flex h-full min-h-screen flex-col items-center bg-[#0E1117] px-4 pb-20 text-neutral-200 sm:px-10">
        <div className="mt-10 flex flex-col items-center justify-center sm:mt-20">
          <div className="text-4xl font-bold">AI 代码转译器</div>

        </div>

        <div className="mt-6 text-center text-sm">
          <BaseUrlInput baseUrl={baseUrl} onChange={handleBaseUrlChange}/>
        </div>

        <div className="mt-6 text-center text-sm">
          <APIKeyInput apiKey={apiKey} onChange={handleApiKeyChange}/>
        </div>

        <br/>
        <div className="mt-2 flex items-center space-x-2">
          <ModelSelect model={model} onChange={(value) => setModel(value)}/>

          <button
            className="w-[140px] cursor-pointer rounded-md bg-violet-500 px-4 py-2 font-bold hover:bg-violet-600 active:bg-violet-700"
            onClick={() => handleTranslate()}
            disabled={loading}
          >
            {loading ? '转译中...' : '转译'}
          </button>
        </div>

        <br/>
        <div className="mt-2 text-center text-xs">
          {loading
            ? '转译中...'
            : hasTranslated
              ? '输出已复制到剪贴板！'
              : '请输入输入代码并按下"转译"'}
        </div>

        <div className="mt-6 flex w-full max-w-[1200px] flex-col justify-between sm:flex-row sm:space-x-4">
          <div className="h-100 flex flex-col justify-center space-y-2 sm:w-2/4">
            <div className="text-center text-xl font-bold">输入 Input</div>

            <LanguageSelect
              language={inputLanguage}
              onChange={(value) => {
                setInputLanguage(value);
                setHasTranslated(false);
                setInputCode('');
                setOutputCode('');
              }}
            />

            {inputLanguage === 'Natural Language' ? (
              <TextBlock
                text={inputCode}
                editable={!loading}
                onChange={(value) => {
                  setInputCode(value);
                  setHasTranslated(false);
                }}
              />
            ) : (
              <CodeBlock
                code={inputCode}
                editable={!loading}
                onChange={(value) => {
                  setInputCode(value);
                  setHasTranslated(false);
                }}
              />
            )}
          </div>
          <div className="mt-8 flex h-full flex-col justify-center space-y-2 sm:mt-0 sm:w-2/4">
            <div className="text-center text-xl font-bold">输出 Output</div>

            <LanguageSelect
              language={outputLanguage}
              onChange={(value) => {
                setOutputLanguage(value);
                setOutputCode('');
              }}
            />

            {outputLanguage === 'Natural Language' ? (
              <TextBlock text={outputCode}/>
            ) : (
              <CodeBlock code={outputCode}/>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
