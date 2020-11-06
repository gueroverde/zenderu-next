import { Field, ID, ObjectType } from "@nestjs/graphql";
import { Prop, Schema } from "@nestjs/mongoose";
import { Types } from "mongoose";

export enum professions {
    TAROT = "TAROT",
    REIKI = "REIKI",
    EXPERT = "Videncia",
} 

@ObjectType()
@Schema({versionKey: false, timestamps: true})
export class ExpertDetail extends Document {
    @Field(() => ID)
    @Prop({ default: Types.ObjectId })
    _id: Types.ObjectId;

    @Field()
    @Prop({ required: true })
    shortDescription: string;

    @Field()
    @Prop({ required: true })
    fullDescription: string;

    @Field()
    @Prop({ required: true })
    guideExperience: string;

    @Field()
    @Prop({ required: true })
    highlights: string;

    @Field()
    @Prop({ required: true })
    certifications: string;

    @Field()
    @Prop({ required: true })
    whereLearned: string;

    @Field()
    @Prop({ required: true })
    realCaseExample: string;

    @Field()
    @Prop({ required: true })
    activityStart: Date;

    @Field()
    @Prop({ required: true })
    professions: professions;

   /* @Field()
    @Prop({ required: true })
    workHours: [];*/

    @Field()
    @Prop({ required: false })
    website: string;

    @Field()
    @Prop({ required: false })
    facebook: string;

    @Field()
    @Prop({ required: false })
    instagram: string;

}