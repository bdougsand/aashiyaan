export const videos = [
  {
    youtubeVideoId: 'bXChsVqt4qo', // corresponds to video at https://www.youtube.com/watch?v=bXChsVqt4qo
    asset: require('./assets/objects/chiliPowder.png'), // corresponds to image located in this repository
  },
  {
    youtubeVideoId: '2J1BGnyu7Hk',
    asset: require('./assets/objects/flipFlop.png'),
  },
  {
    youtubeVideoId: '_LroBWpJ4Ps',
    asset: require('./assets/objects/umbrella.png'),
  },
];

export const camera = {
    permissionMessage: null,
    quality: "480p",
    maxDuration: 600, // in seconds
    maxFileSize: 50 * 1024 * 1024 // in bytes
}

export default { videos };
