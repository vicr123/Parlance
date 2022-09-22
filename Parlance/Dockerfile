FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build

# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_14.x | bash - \
    && apt-get install -y \
        nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /src
COPY ["Parlance/Parlance.csproj", "Parlance/"]
RUN dotnet restore "Parlance/Parlance.csproj"
COPY . .
WORKDIR "/src/Parlance"
RUN dotnet build "Parlance.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Parlance.csproj" -c Release -o /app/publish

FROM base AS final

# Install libgit2
RUN apt-get update && apt-get install -y libgit2-1.1 && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Parlance.dll"]
