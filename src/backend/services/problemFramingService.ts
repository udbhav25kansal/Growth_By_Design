import { queries } from '../database/connection';

// Types for the problem framing system
export interface ProblemFramingSession {
  id: number;
  user_id: number;
  session_name?: string;
  created_at: string;
  updated_at: string;
}

export interface UploadedFile {
  id: number;
  session_id: number;
  agent_type: 'crm_data' | 'customer_interaction' | 'product_analytics';
  original_filename: string;
  file_size: number;
  file_type: string;
  file_extension: string;
  file_path?: string;
  extracted_text: string;
  text_length: number;
  upload_timestamp: string;
  metadata?: string;
}

export interface AIAnalysisResult {
  id: number;
  file_id: number;
  agent_type: 'crm_data' | 'customer_interaction' | 'product_analytics';
  model_used: string;
  prompt_version?: string;
  raw_response: string;
  core_problem?: string;
  root_causes?: string; // JSON array
  primary_recommendation?: string;
  most_affected_segment?: string;
  most_affected_stage?: string;
  key_metrics_to_track?: string; // JSON array
  supporting_evidence?: string;
  analysis_timestamp: string;
  processing_time_ms?: number;
  token_usage?: string; // JSON
  confidence_score?: number;
  user_rating?: number;
  user_notes?: string;
  reviewed_at?: string;
}

export interface ProblemPattern {
  id: number;
  user_id: number;
  pattern_name: string;
  pattern_description?: string;
  first_identified: string;
  last_seen: string;
  occurrence_count: number;
  severity_level: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'resolved' | 'monitoring';
  related_analyses?: string; // JSON array
}

export interface AnalysisTag {
  id: number;
  analysis_id: number;
  tag_name: string;
  tag_category?: string;
  created_at: string;
}

// Service class for problem framing operations
export class ProblemFramingService {
  
  // Session Management
  static async createSession(userId: number, sessionName?: string): Promise<ProblemFramingSession> {
    try {
      const session = queries.createSession.get(userId, sessionName || null) as ProblemFramingSession;
      return session;
    } catch (error) {
      console.error('Error creating problem framing session:', error);
      throw new Error('Failed to create analysis session');
    }
  }

  static async getSessionsByUser(userId: number): Promise<ProblemFramingSession[]> {
    try {
      return queries.getSessionsByUser.all(userId) as ProblemFramingSession[];
    } catch (error) {
      console.error('Error fetching user sessions:', error);
      throw new Error('Failed to fetch analysis sessions');
    }
  }

  static async getSessionById(sessionId: number): Promise<ProblemFramingSession | null> {
    try {
      return queries.getSessionById.get(sessionId) as ProblemFramingSession || null;
    } catch (error) {
      console.error('Error fetching session:', error);
      throw new Error('Failed to fetch analysis session');
    }
  }

  // File Management
  static async saveUploadedFile(
    sessionId: number,
    agentType: 'crm_data' | 'customer_interaction' | 'product_analytics',
    file: File,
    extractedText: string,
    filePath?: string,
    metadata?: any
  ): Promise<UploadedFile> {
    try {
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
      const uploadedFile = queries.createUploadedFile.get(
        sessionId,
        agentType,
        file.name,
        file.size,
        file.type,
        `.${fileExtension}`,
        filePath || null,
        extractedText,
        extractedText.length,
        metadata ? JSON.stringify(metadata) : null
      ) as UploadedFile;

      return uploadedFile;
    } catch (error) {
      console.error('Error saving uploaded file:', error);
      throw new Error('Failed to save uploaded file');
    }
  }

  static async getFilesBySession(sessionId: number): Promise<UploadedFile[]> {
    try {
      return queries.getFilesBySession.all(sessionId) as UploadedFile[];
    } catch (error) {
      console.error('Error fetching session files:', error);
      throw new Error('Failed to fetch session files');
    }
  }

  static async getFilesByAgent(agentType: string): Promise<UploadedFile[]> {
    try {
      return queries.getFilesByAgent.all(agentType) as UploadedFile[];
    } catch (error) {
      console.error('Error fetching agent files:', error);
      throw new Error('Failed to fetch agent files');
    }
  }

  // AI Analysis Management
  static async saveAnalysisResult(
    fileId: number,
    agentType: 'crm_data' | 'customer_interaction' | 'product_analytics',
    modelUsed: string,
    rawResponse: string,
    structuredData: {
      coreProblem?: string;
      rootCauses?: string[];
      primaryRecommendation?: string;
      mostAffectedSegment?: string;
      mostAffectedStage?: string;
      keyMetricsToTrack?: string[];
      supportingEvidence?: string;
    },
    metadata?: {
      promptVersion?: string;
      processingTimeMs?: number;
      tokenUsage?: any;
      confidenceScore?: number;
    }
  ): Promise<AIAnalysisResult> {
    try {
      const analysisResult = queries.createAnalysisResult.get(
        fileId,
        agentType,
        modelUsed,
        metadata?.promptVersion || null,
        rawResponse,
        structuredData.coreProblem || null,
        structuredData.rootCauses ? JSON.stringify(structuredData.rootCauses) : null,
        structuredData.primaryRecommendation || null,
        structuredData.mostAffectedSegment || null,
        structuredData.mostAffectedStage || null,
        structuredData.keyMetricsToTrack ? JSON.stringify(structuredData.keyMetricsToTrack) : null,
        structuredData.supportingEvidence || null,
        metadata?.processingTimeMs || null,
        metadata?.tokenUsage ? JSON.stringify(metadata.tokenUsage) : null,
        metadata?.confidenceScore || null
      ) as AIAnalysisResult;

      return analysisResult;
    } catch (error) {
      console.error('Error saving analysis result:', error);
      throw new Error('Failed to save analysis result');
    }
  }

  static async getAnalysisByFileId(fileId: number): Promise<AIAnalysisResult | null> {
    try {
      return queries.getAnalysisByFileId.get(fileId) as AIAnalysisResult || null;
    } catch (error) {
      console.error('Error fetching analysis by file ID:', error);
      throw new Error('Failed to fetch analysis result');
    }
  }

  static async getAnalysesByUser(userId: number): Promise<any[]> {
    try {
      return queries.getAnalysesByUser.all(userId);
    } catch (error) {
      console.error('Error fetching user analyses:', error);
      throw new Error('Failed to fetch user analyses');
    }
  }

  static async getAnalysesByAgent(agentType: string): Promise<AIAnalysisResult[]> {
    try {
      return queries.getAnalysesByAgent.all(agentType) as AIAnalysisResult[];
    } catch (error) {
      console.error('Error fetching agent analyses:', error);
      throw new Error('Failed to fetch agent analyses');
    }
  }

  static async updateAnalysisRating(analysisId: number, rating: number, notes?: string): Promise<void> {
    try {
      queries.updateAnalysisRating.run(rating, notes || null, analysisId);
    } catch (error) {
      console.error('Error updating analysis rating:', error);
      throw new Error('Failed to update analysis rating');
    }
  }

  // Pattern Management
  static async createProblemPattern(
    userId: number,
    patternName: string,
    patternDescription?: string,
    severityLevel: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    status: 'active' | 'resolved' | 'monitoring' = 'active',
    relatedAnalyses?: number[]
  ): Promise<ProblemPattern> {
    try {
      const pattern = queries.createProblemPattern.get(
        userId,
        patternName,
        patternDescription || null,
        severityLevel,
        status,
        relatedAnalyses ? JSON.stringify(relatedAnalyses) : null
      ) as ProblemPattern;

      return pattern;
    } catch (error) {
      console.error('Error creating problem pattern:', error);
      throw new Error('Failed to create problem pattern');
    }
  }

  static async getPatternsByUser(userId: number): Promise<ProblemPattern[]> {
    try {
      return queries.getPatternsByUser.all(userId) as ProblemPattern[];
    } catch (error) {
      console.error('Error fetching user patterns:', error);
      throw new Error('Failed to fetch user patterns');
    }
  }

  static async updatePatternOccurrence(patternId: number, relatedAnalyses: number[]): Promise<ProblemPattern> {
    try {
      return queries.updatePatternOccurrence.get(JSON.stringify(relatedAnalyses), patternId) as ProblemPattern;
    } catch (error) {
      console.error('Error updating pattern occurrence:', error);
      throw new Error('Failed to update pattern occurrence');
    }
  }

  static async updatePatternStatus(patternId: number, status: 'active' | 'resolved' | 'monitoring'): Promise<ProblemPattern> {
    try {
      return queries.updatePatternStatus.get(status, patternId) as ProblemPattern;
    } catch (error) {
      console.error('Error updating pattern status:', error);
      throw new Error('Failed to update pattern status');
    }
  }

  // Tagging System
  static async createAnalysisTag(
    analysisId: number,
    tagName: string,
    tagCategory?: string
  ): Promise<AnalysisTag> {
    try {
      return queries.createAnalysisTag.get(analysisId, tagName, tagCategory || null) as AnalysisTag;
    } catch (error) {
      console.error('Error creating analysis tag:', error);
      throw new Error('Failed to create analysis tag');
    }
  }

  static async getTagsByAnalysis(analysisId: number): Promise<AnalysisTag[]> {
    try {
      return queries.getTagsByAnalysis.all(analysisId) as AnalysisTag[];
    } catch (error) {
      console.error('Error fetching analysis tags:', error);
      throw new Error('Failed to fetch analysis tags');
    }
  }

  static async getAnalysesByTag(tagName: string): Promise<any[]> {
    try {
      return queries.getAnalysesByTag.all(tagName);
    } catch (error) {
      console.error('Error fetching analyses by tag:', error);
      throw new Error('Failed to fetch analyses by tag');
    }
  }

  // Utility Methods
  static parseStructuredResponse(rawResponse: string, agentType: string): any {
    try {
      const structured: any = {};

      // Common patterns across all agents
      const coreProblemMatch = rawResponse.match(/\*\*CORE.*?PROBLEM:\*\*\s*([\s\S]*?)(?=\n\*\*|$)/);
      if (coreProblemMatch) {
        structured.coreProblem = coreProblemMatch[1].trim();
      }

      const rootCausesMatch = rawResponse.match(/\*\*ROOT CAUSES:\*\*\s*([\s\S]*?)(?=\n\*\*|$)/);
      if (rootCausesMatch) {
        const causes = rootCausesMatch[1].trim().split('\n').map(line => line.replace(/^•\s*/, '').trim()).filter(Boolean);
        structured.rootCauses = causes;
      }

      const recommendationMatch = rawResponse.match(/\*\*PRIMARY RECOMMENDATION:\*\*\s*([\s\S]*?)(?=\n\*\*|$)/);
      if (recommendationMatch) {
        structured.primaryRecommendation = recommendationMatch[1].trim();
      }

      // Agent-specific patterns
      if (agentType === 'customer_interaction') {
        const segmentMatch = rawResponse.match(/\*\*MOST AFFECTED SEGMENT:\*\*\s*([\s\S]*?)(?=\n\*\*|$)/);
        if (segmentMatch) {
          structured.mostAffectedSegment = segmentMatch[1].trim();
        }
      }

      if (agentType === 'product_analytics') {
        const stageMatch = rawResponse.match(/\*\*MOST AFFECTED STAGE:\*\*\s*([\s\S]*?)(?=\n\*\*|$)/);
        if (stageMatch) {
          structured.mostAffectedStage = stageMatch[1].trim();
        }

        const metricsMatch = rawResponse.match(/\*\*KEY METRICS TO TRACK:\*\*\s*([\s\S]*?)(?=\n\*\*|$)/);
        if (metricsMatch) {
          const metrics = metricsMatch[1].trim().split('\n').map(line => line.replace(/^•\s*/, '').trim()).filter(Boolean);
          structured.keyMetricsToTrack = metrics;
        }
      }

      const evidenceMatch = rawResponse.match(/\*\*SUPPORTING EVIDENCE:\*\*\s*([\s\S]*?)(?=\n\*\*|$)/);
      if (evidenceMatch) {
        structured.supportingEvidence = evidenceMatch[1].trim();
      }

      return structured;
    } catch (error) {
      console.error('Error parsing structured response:', error);
      return {};
    }
  }

  // Analytics and Insights
  static async getUserAnalyticsOverview(userId: number): Promise<any> {
    try {
      const sessions = await this.getSessionsByUser(userId);
      const analyses = await this.getAnalysesByUser(userId);

      const agentUsage = {
        crm_data: analyses.filter(a => a.agent_type === 'crm_data').length,
        customer_interaction: analyses.filter(a => a.agent_type === 'customer_interaction').length,
        product_analytics: analyses.filter(a => a.agent_type === 'product_analytics').length,
      };

      return {
        totalSessions: sessions.length,
        totalAnalyses: analyses.length,
        agentUsage,
        recentAnalyses: analyses.slice(0, 5),
      };
    } catch (error) {
      console.error('Error fetching user analytics overview:', error);
      throw new Error('Failed to fetch analytics overview');
    }
  }
} 