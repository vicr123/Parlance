FROM archlinux AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM archlinux AS build

# Install Node.js
RUN pacman -Sy --noconfirm nodejs dotnet-runtime dotnet-sdk aspnet-targeting-pack npm && rm -rf /var/lib/pacman/sync

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
RUN pacman -Sy --noconfirm libgit2 dotnet-runtime aspnet-runtime && rm -rf /var/lib/pacman/sync

WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Parlance.dll"]
