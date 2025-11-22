import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { LLMRequest, LLMResponse, Property } from '../types';

export class LLMService {
  private openai?: OpenAI;
  private anthropic?: Anthropic;

  constructor() {
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }

    if (process.env.ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
    }
  }

  async analyzeContract(request: LLMRequest, provider: 'openai' | 'anthropic' = 'openai'): Promise<LLMResponse> {
    const prompt = this.buildPrompt(request);
    const schema = this.getContractSchema();

    try {
      if (provider === 'openai' && this.openai) {
        return await this.callOpenAI(prompt, schema);
      } else if (provider === 'anthropic' && this.anthropic) {
        return await this.callAnthropic(prompt, schema);
      } else {
        throw new Error(`Provider ${provider} not available`);
      }
    } catch (error) {
      console.error('LLM analysis failed:', error);
      throw error;
    }
  }

  private buildPrompt(request: LLMRequest): string {
    let prompt = `Analyze the following real estate contract document and extract all relevant fields.

CONTEXT:
Document Text:
${request.context.documentText}

`;

    if (request.context.propertyData) {
      prompt += `
Property Data:
${JSON.stringify(request.context.propertyData, null, 2)}

`;
    }

    if (request.context.keyImages && request.context.keyImages.length > 0) {
      prompt += `
Key Images/Sections:
${request.context.keyImages.join(', ')}

`;
    }

    prompt += `
Please extract all contract fields and provide confidence scores for each extraction. Focus on:
- Property details (address, price, dimensions)
- Parties involved (buyer, seller, agents)
- Important dates (closing, possession, contingencies)
- Financial terms (price, deposits, financing)
- Legal clauses and requirements

Return your response as a JSON object following the exact schema provided. Include confidence scores (0-1) for each field and provide reasoning when uncertain.

`;
    
    return prompt;
  }

  private async callOpenAI(prompt: string, schema: any): Promise<LLMResponse> {
    const completion = await this.openai!.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are a precise real estate contract analyzer. Return only valid JSON following the provided schema.'
        },
        {
          role: 'user',
          content: prompt + '\n\nSchema:\n' + JSON.stringify(schema, null, 2)
        }
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' }
    });

    const responseText = completion.choices[0]?.message?.content || '{}';
    
    try {
      return JSON.parse(responseText);
    } catch (error) {
      console.error('Failed to parse OpenAI response:', responseText);
      throw new Error('Invalid JSON response from OpenAI');
    }
  }

  private async callAnthropic(prompt: string, schema: any): Promise<LLMResponse> {
    // @ts-ignore - Anthropic SDK types may not be up to date
    const message = await this.anthropic!.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: prompt + '\n\nSchema:\n' + JSON.stringify(schema, null, 2)
        }
      ],
      temperature: 0.1
    });

    const responseText = message.content[0]?.type === 'text' ? message.content[0].text : '{}';
    
    try {
      return JSON.parse(responseText);
    } catch (error) {
      console.error('Failed to parse Anthropic response:', responseText);
      throw new Error('Invalid JSON response from Anthropic');
    }
  }

  getContractSchema(): any {
    return {
      type: 'object',
      properties: {
        fields: {
          type: 'object',
          properties: {
            propertyAddress: { type: 'string', description: 'Full property address' },
            purchasePrice: { type: 'number', description: 'Total purchase price in dollars' },
            buyerName: { type: 'string', description: 'Full legal name of buyer' },
            sellerName: { type: 'string', description: 'Full legal name of seller' },
            closingDate: { type: 'string', description: 'Closing date (YYYY-MM-DD format)' },
            possessionDate: { type: 'string', description: 'Date of possession (YYYY-MM-DD format)' },
            earnestMoney: { type: 'number', description: 'Earnest money amount in dollars' },
            financingType: { type: 'string', description: 'Type of financing (cash, conventional, FHA, VA, etc.)' },
            contingencyPeriod: { type: 'number', description: 'Contingency period in days' },
            inspectionPeriod: { type: 'number', description: 'Inspection period in days' },
            appraisalContingency: { type: 'boolean', description: 'Whether appraisal contingency exists' },
            loanContingency: { type: 'boolean', description: 'Whether loan contingency exists' },
            propertyType: { type: 'string', description: 'Property type (single family, condo, townhouse, etc.)' },
            squareFootage: { type: 'number', description: 'Property square footage' },
            bedrooms: { type: 'number', description: 'Number of bedrooms' },
            bathrooms: { type: 'number', description: 'Number of bathrooms' },
            parcelId: { type: 'string', description: 'Parcel/APN number' },
            legalDescription: { type: 'string', description: 'Legal description of property' },
            hoaName: { type: 'string', description: 'HOA name if applicable' },
            hoaFee: { type: 'number', description: 'Monthly HOA fee' },
            propertyTaxes: { type: 'number', description: 'Annual property taxes' },
            sellerCredits: { type: 'number', description: 'Seller credits in dollars' },
            closingCosts: { type: 'string', description: 'Who pays closing costs' },
            titleCompany: { type: 'string', description: 'Title company name' },
            escrowOfficer: { type: 'string', description: 'Escrow officer name' },
            brokerName: { type: 'string', description: 'Broker/realty company name' },
            specialConditions: { type: 'string', description: 'Any special conditions or notes' }
          }
        },
        confidence: {
          type: 'object',
          description: 'Confidence scores (0-1) for each field',
          properties: {} // Will be populated dynamically
        },
        reasoning: { type: 'string', description: 'Overall reasoning and any uncertainties' }
      },
      required: ['fields', 'confidence']
    };
  }
}