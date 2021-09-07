//

import {
  DocumentType,
  getModelForClass,
  modelOptions,
  prop
} from "@typegoose/typegoose";
import {
  compareSync,
  hashSync
} from "bcrypt";
import {
  Jsonify
} from "jsonify-type";
import {
  Creator as CreatorSkeleton
} from "/client/skeleton/creator";
import {
  CustomError
} from "/server/model/error";
import {
  FamilyModel
} from "/server/model/family";


@modelOptions({schemaOptions: {collection: "creators"}})
export class CreatorSchema {

  @prop({required: true, unique: true})
  public code!: string;

  @prop({required: true})
  public name!: string;

  @prop()
  public homepageUrl?: string;

  @prop()
  public twitterId?: string;

  @prop()
  public biography?: string;

  @prop()
  public authority?: string;

  @prop({required: true})
  public hash!: string;

  @prop({required: true})
  public approved!: boolean;

  @prop({required: true})
  public createdDate!: Date;

  @prop()
  public approvedDate?: Date;

  public async changeInformations(this: Creator, informations: any): Promise<Creator> {
    let anyThis = this as any;
    for (let [key, value] of Object.entries(informations)) {
      if (value !== undefined) {
        anyThis[key] = value;
      }
    }
    await this.save();
    return this;
  }

  // 渡された情報からユーザーを作成し、データベースに保存します。
  // このとき、名前が妥当な文字列かどうか、およびすでに同じ名前のユーザーが存在しないかどうかを検証し、不適切だった場合はエラーを発生させます。
  // 渡されたパスワードは自動的にハッシュ化されます。
  public static async register(code: string, name: string, password: string): Promise<Creator> {
    if (!code.match(/^[a-z]{3}$/)) {
      throw new CustomError("invalidCreatorCode");
    } else {
      let duplicate = await this.checkDuplication(code);
      if (duplicate) {
        throw new CustomError("duplicateCreatorCode");
      } else {
        let approved = false;
        let createdDate = new Date();
        let user = new CreatorModel({code, name, approved, createdDate});
        await user.encryptPassword(password);
        await user.save();
        return user;
      }
    }
  }

  // 渡された名前とパスワードに合致するユーザーを返します。
  // 渡された名前のユーザーが存在しない場合や、パスワードが誤っている場合は、null を返します。
  public static async authenticate(code: string, password: string): Promise<Creator | null> {
    let user = await CreatorModel.findOne().where("code", code);
    if (user && user.comparePassword(password)) {
      return user;
    } else {
      return null;
    }
  }

  public static async fetchOneByCode(code: string): Promise<Creator | null> {
    let creator = await CreatorModel.findOne().where("code", code);
    return creator;
  }

  // 引数に渡された生パスワードをハッシュ化して、自身のプロパティを上書きします。
  // データベースへの保存は行わないので、別途保存処理を行ってください。
  private async encryptPassword(password: string): Promise<void> {
    let hash = hashSync(password, 10);
    this.hash = hash;
  }

  private comparePassword(password: string): boolean {
    return compareSync(password, this.hash);
  }

  public static async checkDuplication(code: string): Promise<boolean> {
    let creatorQuery = CreatorModel.findOne().where("code", code);
    let familyQuery = FamilyModel.findOne().where("codes.family", code);
    let [creator, family] = await Promise.all([creatorQuery, familyQuery]);
    let duplicate = creator !== null || family !== null;
    return duplicate;
  }

}


export class CreatorCreator {

  public static create(raw: Creator): Jsonify<CreatorSkeleton> {
    let id = raw.id;
    let kind = "creator" as const;
    let codes = {creator: raw.code};
    let code = raw.code;
    let names = {creator: raw.name};
    let name = raw.name;
    let homepageUrl = raw.homepageUrl;
    let twitterId = raw.twitterId;
    let biography = raw.biography;
    let authority = raw.authority;
    let approved = raw.approved;
    let createdDate = raw.createdDate.toISOString();
    let approvedDate = raw.approvedDate?.toISOString();
    let skeleton = {id, kind, codes, code, names, name, homepageUrl, twitterId, biography, authority, approved, createdDate, approvedDate};
    return skeleton;
  }

}


export type Creator = DocumentType<CreatorSchema>;
export let CreatorModel = getModelForClass(CreatorSchema);