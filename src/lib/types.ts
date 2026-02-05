 export type DetectionType = 
   | 'image' 
   | 'video' 
   | 'audio' 
   | 'text' 
   | 'email' 
   | 'sms' 
   | 'review' 
   | 'investment' 
   | 'job_offer' 
   | 'other';
 
 export type DetectionStatus = 'pending' | 'processing' | 'completed' | 'failed';
 
 export type Verdict = 'real' | 'fake' | 'suspicious';
 
 export type ConfidenceLevel = 'low' | 'medium' | 'high';
 
 export interface Scan {
   id: string;
   user_id: string;
   detection_type: DetectionType;
   status: DetectionStatus;
   file_url: string | null;
   text_content: string | null;
   file_name: string | null;
   file_size: number | null;
   created_at: string;
   updated_at: string;
 }
 
 export interface ScanResult {
   id: string;
   scan_id: string;
   verdict: Verdict;
   risk_score: number;
   confidence: ConfidenceLevel;
   explanation: string;
   indicators: string[];
   ai_analysis: string | null;
   created_at: string;
 }
 
 export interface ScanWithResult extends Scan {
   scan_results?: ScanResult[];
 }
 
 export interface Profile {
   id: string;
   user_id: string;
   email: string | null;
   full_name: string | null;
   avatar_url: string | null;
   created_at: string;
   updated_at: string;
 }