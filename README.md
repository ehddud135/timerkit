# TimerKit — All-in-one Timer (Stopwatch · Tabata · Cooking · Running)

한 앱에서 네 가지 타이머 모드를 지원하는 React Native(Expo SDK 54) 프로젝트입니다.
Android에선 Foreground Service + Chronometer로 **상단바 1초 단위 카운트다운**을 구현했습니다.

## Demo
(추가예정)
(모드 전환 GIF)
(안드로이드 상단바 카운트다운 GIF)

## Install & Run
   ```bash
   npm install
   npx expo start
   ```
In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

## Features
- Stopwatch: 랩 타임, 일시정지/재개
- Tabata: Work/Rest 인터벌, 라운드/세트 커스텀
- Cooking: 멀티 스텝, 메모/레시피 저장
- Running: (로드맵) 거리/페이스, 음성 안내

## Roadmap
- iOS **Live Activities** 지원
- 러닝 모드 거리/페이스 트래킹
