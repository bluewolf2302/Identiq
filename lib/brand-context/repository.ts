import type {
  BrandContextQuery,
  BrandKnowledgeRecord,
} from "./types";

export interface BrandKnowledgeRepository {
  getBrandKnowledge(
    query: BrandContextQuery,
  ): Promise<BrandKnowledgeRecord | null>;
}

export class BrandKnowledgeRepositoryError extends Error {
  public readonly cause: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = "BrandKnowledgeRepositoryError";
    this.cause = cause;
  }
}
