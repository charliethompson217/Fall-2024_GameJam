export const getAssetUrl = (assetName) => {
    const baseUrl = 'https://fall2024gamejamassets.s3.us-east-2.amazonaws.com/';
    return `${baseUrl}${assetName}`;
};