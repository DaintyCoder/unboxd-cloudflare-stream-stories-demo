import { Story } from "./types/stories";

const imageIds = [
  "f98d9c30-5366-4812-84d7-fd44ff681600",
  "a3dc280e-9764-4495-9e8e-5722cf40c900",
  "35c748ca-25cd-4f45-4d05-f5b48bb4a900",
  "caa15db5-faf6-4353-8d15-0aa591e4db00",
  "f173d47b-dfaa-4603-c20a-a03262512f00",
  "fae788b9-ac0e-438f-bed5-6db663413a00",
  "68abb1b5-fb85-41cf-5d20-bfaca76d9100",
  "dd0f37f1-9f40-449b-718c-78446e042800",
  "29a067f6-429a-4da9-cde4-b2d0e50ded00",
  "9de9d91c-79b7-4f86-3ad4-197e07792400",
  "9304ea0c-61c8-430f-be0e-4e1ee321b800",
  "5404a46e-5184-46bc-a135-96473f4e7c00",
  "bd3d4426-139f-4b08-f9f4-8716e29f4e00",
  "28f97234-62df-4c31-1f59-ddef35bea700",
  "8a55b3f4-dd80-4db2-e7b6-927d208c0e00",
  "a568aa29-5ab2-4888-1f1e-926b481ada00",
  "cb0407b1-5589-4969-9582-9ec260c2ac00",
  "0b1ae277-9c62-4039-a2fc-02287c9b7100",
  "94d10b1d-d9f4-4e78-37ea-d42e52a81f00",
  "64d1aaaf-dbf1-4c6a-9edb-14b359b44200",
  "4a97ad6c-7e43-408d-c8d4-2376db558d00",
  "e26e7ea5-452a-4617-51e2-8f03065bd600",
  "3706a77e-4c39-426d-4391-b065d6faf300",
  "613ca845-f0f1-4d71-1856-3f3083f00e00",
  "8cf60935-e02c-4501-8e66-3a84bafb5300",
  "3158728c-5cf3-4a47-6d64-8a5877b89a00",
  "a206cc58-ada9-48e1-5ea2-dab0e0eb4600",
  "c13126db-9c39-4cb2-2ee4-a4c18fa78c00",
  "8a81ea24-8f99-4ee1-42b7-48e6e9f99200",
  "44f0759c-58a1-4058-968d-cee6c6e3d600",
];

export const imageURLs = imageIds.map(
  (img) => `https://imagedelivery.net/bmp-razVZ-kOSeJIbPT4Wg/${img}/public`,
);

const videoUids = [
  "3764a707b5c4434c9e2dd03c7b9273bc",
  "c189a0c213bd4065866effab679a4953",
  "bac1e85570a4426493e22214a9a86d5f",
  "a0873f89514a4b0d8625303e19374c79",
  "7d3ad7a2742445b3b14460570e9a80b5",
  "20fba7b29f8046719471a41116bccec9",
  "5600a6332f46431a8fd2699276c0ff9c",
  "f05a7aeb0e6f4e98935e158ad86e4b0a",
  "55b32000cab64a1eb0e78414b4080acd",
  "5a8ae37e97434d098918b1cc261755ce",
  "f59be86bc3d74251a21d384b29fc739e",
  "a92382aa20834bcf8a028b760ce7c809",
  "67a1b7689253401d981fec8ee8add3ba",
  "ab3341839a694d1eb22fc9e37e3e4958",
  "c39f0cc9af91445d8fae5e7ba72be99b",
  "1c3f413c5dff407a94265c43436ca017",
  "33ab6758757b4381965659c1cd4720fd",
  "82e2f46277c340eba3cee4640f3f9f45",
  "e3f5c349c7134f97bf89d0b518cbe058",
  "5ec24b9e8f5d425d9d601008c4ae4348",
  "b6d3f69d708e4671a35224aa778d019d",
  "03fbf4674bc84811bcb99733af320a34",
  "8003406c13014234a1dfcae5f962290d",
  "a3028200691344dc9b6df3a6f356c75b",
  "59466ede1392479683ee2008ba455ab2",
  "8c770f81bee446e181cb6f846fdb1d8d",
  "e43930506777416e8dadb4974af2239b",
  "501d79a284da461eb3f46bc5b7f9aec7",
  "37ce14ecc710453ab9156c0382f5018f",
  "fe1c321ff9994fd5a6dcdc92901faabd",
];

export const videoUidUrls = videoUids.map((uid) => {
  const videoURL = `https://customer-cotlm04ai8gx1o8i.cloudflarestream.com/${uid}/manifest/video.m3u8`;
  const thumbnailURL = `https://customer-cotlm04ai8gx1o8i.cloudflarestream.com/${uid}/thumbnails/thumbnail.jpg`;
  return {
    videoURL,
    thumbnailURL,
  };
});

const names = [
  "John",
  "Jane",
  "Alice",
  "Bob",
  "Charlie",
  "Dave",
  "Eve",
  "Frank",
  "Grace",
  "Hank",
  "Ivy",
  "Jack",
  "Kara",
  "Leo",
  "Mia",
  "Nina",
  "Oscar",
  "Paul",
  "Quinn",
  "Rita",
];

const surnames = [
  "Smith",
  "Johnson",
  "Brown",
  "Williams",
  "Jones",
  "Garcia",
  "Miller",
  "Davis",
  "Martinez",
  "Lopez",
  "Clark",
  "Lewis",
  "Walker",
  "Hall",
  "Allen",
  "Young",
  "Hernandez",
  "King",
  "Wright",
  "Scott",
];

function getRandomName() {
  const firstName = names[Math.floor(Math.random() * names.length)];
  const lastName = surnames[Math.floor(Math.random() * surnames.length)];
  return `${firstName} ${lastName}`;
}

function generateStories(count = 10): Story[] {
  return Array.from({ length: count }, (_, index) => {
    const mediaCount = Math.floor(Math.random() * 3) + 1; // Ensure at least 1 media item
    const media = [];

    for (let i = 0; i < mediaCount; i++) {
      if (Math.random() > 0.5 && videoUidUrls.length) {
        const video =
          videoUidUrls[Math.floor(Math.random() * videoUidUrls.length)];
        media.push({
          type: "video",
          streamId: video.videoURL,
          thumbnail: video.thumbnailURL,
        });
      } else if (imageURLs.length) {
        const image = imageURLs[Math.floor(Math.random() * imageURLs.length)];
        media.push({
          type: "image",
          url: image,
          duration: 5000,
        });
      }
    }

    return {
      id: (index + 1).toString(),
      user: {
        name: getRandomName(),
        avatar: imageURLs[Math.floor(Math.random() * imageURLs.length)], // Random avatar
      },
      media,
    };
  }) as any;
}

export const stories = generateStories(10);
// console.log({ stories });
