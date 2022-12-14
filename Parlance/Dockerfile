FROM archlinux AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

#RUN echo "Server=https://archive.archlinux.org/repos/2022/11/01/\$repo/os/\$arch" > /etc/pacman.d/mirrorlist

FROM archlinux AS build

#RUN echo "Server=https://archive.archlinux.org/repos/2022/11/01/\$repo/os/\$arch" > /etc/pacman.d/mirrorlist

# Install Node.js
RUN pacman -Syyu --noconfirm nodejs dotnet-runtime dotnet-sdk aspnet-targeting-pack npm && rm -rf /var/lib/pacman/sync

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
RUN pacman -Syy --noconfirm libgit2 dotnet-runtime aspnet-runtime && rm -rf /var/lib/pacman/sync

WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Parlance.dll"]
