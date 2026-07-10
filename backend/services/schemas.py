from pydantic import BaseModel, Field


class JournalInsights(BaseModel):
    summary: str = ""
    emotions: list[str] = Field(default_factory=list)
    patterns: list[str] = Field(default_factory=list)
    insights: list[str] = Field(default_factory=list)
    suggestions: list[str] = Field(default_factory=list)
    uniqueness_note: str = ""


class ThoughtReview(BaseModel):
    patterns: list[str] = Field(default_factory=list)
    weaknesses: list[str] = Field(default_factory=list)
    personality: list[str] = Field(default_factory=list)
    emotional_cycles: list[str] = Field(default_factory=list)
    behavior_loops: list[str] = Field(default_factory=list)
    growth_suggestions: list[str] = Field(default_factory=list)


class PersonalityModel(BaseModel):
    traits: list[str] = Field(default_factory=list)
    dominant_patterns: list[str] = Field(default_factory=list)
    emotional_tendencies: list[str] = Field(default_factory=list)
    cognitive_biases: list[str] = Field(default_factory=list)
    confidence_profile: list[str] = Field(default_factory=list)
