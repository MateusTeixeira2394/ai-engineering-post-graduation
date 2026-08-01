import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import {
    RecursiveCharacterTextSplitter
} from '@langchain/textsplitters';
import { type TextSplitterConfig } from "../config.ts";

export class DocumentProcessor {
    private pdfPath: string;
    private textSplitterconfig: TextSplitterConfig;

    constructor(pdfPath: string, textSplitterconfig: TextSplitterConfig) {
        this.pdfPath = pdfPath;
        this.textSplitterconfig = textSplitterconfig;
    }

    async loadAndSplitPDF(): Promise<Document[]> {
        console.log(`📃 Reading the PDF from path: ${this.pdfPath}...`);

        const loader = new PDFLoader(this.pdfPath);
        const rawDocuments = await loader.load();
        console.log(`📃 Loaded ${rawDocuments.length} pages from the PDF.`);

        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: this.textSplitterconfig.chunkSize,
            chunkOverlap: this.textSplitterconfig.chunkOverlap,
        });

        const splitDocuments = await splitter.splitDocuments(rawDocuments);
        console.log(`📃 Split the documents into ${splitDocuments.length} chunks.`);

        return splitDocuments.map((doc, index) => ({
            // LangChain vector stores read the chunk text from `pageContent`;
            // renaming it here would make the store embed `undefined`.
            pageContent: doc.pageContent,
            metadata: {
                totalPages: doc.metadata.pdf.totalPages,
                pageNumber: doc.metadata.loc.pageNumber,
                source: doc.metadata.source,
                chunkPosition: index + 1,
            }
        }));
    }
}

export type Document = {
    pageContent: string;
    metadata: {
        totalPages: number;
        pageNumber: number;
        source: string;
        chunkPosition: number;
    }
}