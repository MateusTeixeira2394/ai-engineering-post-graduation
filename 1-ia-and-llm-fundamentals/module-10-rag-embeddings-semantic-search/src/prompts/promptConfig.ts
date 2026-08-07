const promptsFolder = './prompts';
export const promptsFiles = {
    answerPrompt: `${promptsFolder}/answerPrompt.json`,
    template: `${promptsFolder}/template.txt`,
};

export type AnswerPromptExample = {
    question: string;
    expected_structure: string;
};

export type AnswerPromptConstraints = {
    language: string;
    tone: string;
    max_length: number;
    format: string;
};

export type AnswerPromptContextRules = {
    use_only_provided_context: boolean;
    cite_examples_from_context: boolean;
    indicate_if_insufficient_context: boolean;
};

export type AnswerPrompt = {
    task: string;
    role: string;
    instructions: string[];
    constraints: AnswerPromptConstraints;
    examples: AnswerPromptExample[];
    context_rules: AnswerPromptContextRules;
};