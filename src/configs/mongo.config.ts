import { ConfigService } from "@nestjs/config";

export const getMongoConfig = async (
  configService: ConfigService,
) => {
  return {
    uri: getMongoString(configService),
    ...getMongoOptions(),
  };
};

const getMongoString = (configService: ConfigService) => configService.get('MONGO_CLOUD_URI');

const getMongoOptions = () => ({
  useNewUrlParser: true,
  useUnifiedTopology: true,
});