FROM mcr.microsoft.com/dotnet/aspnet:9.0-alpine AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/aspnet:9.0-alpine AS native-build

RUN apk add git cmake ninja build-base openssl-dev
WORKDIR /src
RUN git clone --branch libssh2-1.11.0 --depth 1 https://github.com/libssh2/libssh2.git
RUN git clone --branch v1.8.1 --depth 1 https://github.com/libgit2/libgit2.git

WORKDIR /src/libssh2
RUN cmake -B /build/libssh2 -GNinja -DBUILD_STATIC=OFF -DBUILD_SHARED=ON && cmake --build /build/libssh2 && cmake --install /build/libssh2

WORKDIR /src/libgit2
RUN cmake -B /build/libgit2 -GNinja -DUSE_SSH=ON -DBUILD_TESTS=OFF && cmake --build /build/libgit2 && cmake --install /build/libgit2

FROM native-build AS native-build-output
RUN mkdir -p /output
RUN cp /usr/local/lib/*.so* /output/

FROM mcr.microsoft.com/dotnet/sdk:9.0-alpine AS build

# Install Node.js
RUN apk add nodejs pnpm

WORKDIR /src
COPY . .
RUN dotnet restore "Parlance/Parlance.csproj"
WORKDIR "/src/Parlance"
RUN dotnet build "Parlance.csproj" -c Release -o /app/build

FROM build AS publish
RUN mkdir -p ~/.aspnet/https
RUN dotnet publish "Parlance.csproj" -c Release -o /app/publish
RUN ls /app/publish/wwwroot

FROM base AS final

# Install openssl
RUN apk add libcrypto3 icu

WORKDIR /opt/local-libs
COPY --from=native-build-output /output ./

WORKDIR /app
COPY --from=publish /app/publish .

ENV LD_LIBRARY_PATH=/opt/local-libs
ENTRYPOINT ["dotnet", "Parlance.dll"]
