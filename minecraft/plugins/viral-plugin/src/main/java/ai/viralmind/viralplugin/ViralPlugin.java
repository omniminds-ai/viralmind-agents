package ai.viralmind.viralplugin;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.reflect.TypeToken;
import net.luckperms.api.LuckPerms;
import net.luckperms.api.model.user.User;
import net.luckperms.api.node.Node;
import org.bukkit.Bukkit;
import org.bukkit.ChatColor;
import org.bukkit.Material;
import org.bukkit.NamespacedKey;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.player.AsyncPlayerChatEvent;
import org.bukkit.event.player.PlayerJoinEvent;
import org.bukkit.event.player.PlayerInteractEvent;
import org.bukkit.event.block.Action;
import org.bukkit.inventory.ItemStack;
import org.bukkit.inventory.meta.ItemMeta;
import org.bukkit.persistence.PersistentDataType;
import org.bukkit.plugin.RegisteredServiceProvider;
import org.bukkit.plugin.java.JavaPlugin;
import org.bukkit.scheduler.BukkitTask;

import io.github.cdimascio.dotenv.Dotenv;

import java.io.File;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.List;
import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.CompletableFuture;

public class ViralPlugin extends JavaPlugin implements Listener {
    private final Dotenv dotenv = Dotenv.load();
    private final String API_SECRET = dotenv.get("API_SECRET");
    private final String webhookUrl = dotenv.get("DISCORD_WEBHOOK_URL");
    private NamespacedKey prizeGoldKey;
    private final Set<String> blacklistedPlayers = new HashSet<>();
    private final Set<String> vipPlayers = new HashSet<>();
    private final Gson gson = new Gson();
    private final HttpClient httpClient = HttpClient.newHttpClient();
    private static final boolean USE_MOCK_API = false;
    private LuckPerms luckPerms;

    private Set<String> processedMessageIds = new HashSet<>();
    private File processedIdsFile;
    private BukkitTask pollTask;

    @Override
    public void onEnable() {
        // Setup LuckPerms
        RegisteredServiceProvider<LuckPerms> provider = Bukkit.getServicesManager().getRegistration(LuckPerms.class);
        if (provider != null) {
            luckPerms = provider.getProvider();
            getLogger().info("Successfully hooked into LuckPerms!");
        } else {
            getLogger().severe("Could not find LuckPerms! Plugin will be disabled.");
            getServer().getPluginManager().disablePlugin(this);
            return;
        }

        getServer().getPluginManager().registerEvents(this, this);
        prizeGoldKey = new NamespacedKey(this, "prize_gold");
        initializeBlacklist();
        initializeVipPlayers();

        this.getCommand("giveprizegold").setExecutor((sender, command, label, args) -> {
            if (sender.hasPermission("prizegold.give")) {
                if (args.length >= 1) {
                    Player target = getServer().getPlayer(args[0]);
                    if (target != null) {
                        target.getInventory().addItem(createPrizeGold());
                        sender.sendMessage("§aGave Prize Gold to " + target.getName());
                        return true;
                    }
                }
            }
            return false;
        });

        getLogger().info("Mock API is " + (USE_MOCK_API ? "ENABLED" : "DISABLED"));
        processedIdsFile = new File(getDataFolder(), "processed_ids.json");
        loadProcessedIds();
        startPollingTask();
    }

    // Helper method to manage LuckPerms permissions
    private void updatePlayerPermissions(Player player, boolean shouldHaveBypass) {
        User user = luckPerms.getUserManager().getUser(player.getUniqueId());
        if (user == null) {
            getLogger().warning("Could not find LuckPerms user for " + player.getName());
            return;
        }

        // Remove existing permission if it exists
        user.data().remove(Node.builder("coordinateoffset.bypass").build());

        // Add permission if needed
        if (shouldHaveBypass) {
            user.data().add(Node.builder("coordinateoffset.bypass").build());
        }

        // Save changes
        luckPerms.getUserManager().saveUser(user);
    }

    private String getMockApiResponse(String playerName) {
        if (playerName.equalsIgnoreCase("throwaway_name")) {
            return """
                    {
                        "whitelist": [{
                            "username": "throwaway_name",
                            "address": "rich_player_address_J31XET6BiQE2eiVgx2PF6G45rPK6VNKWKrog4u2gj5nv",
                            "viral_balance": 2000000.0,
                            "signature": "mock_signature",
                            "_id": "mock_id"
                        }]
                    }
                    """;
        } else if (playerName.equalsIgnoreCase("poor_player")) {
            return """
                    {
                        "whitelist": [{
                            "username": "poor_player",
                            "address": "poor_player_address_A31XET6BiQE2eiVgx2PF6G45rPK6VNKWKrog4u2gj5nv",
                            "viral_balance": 10000.0,
                            "signature": "mock_signature",
                            "_id": "mock_id"
                        }]
                    }
                    """;
        } else if (playerName.equalsIgnoreCase("normal_player")) {
            return """
                    {
                        "whitelist": [{
                            "username": "normal_player",
                            "address": "normal_player_address_B31XET6BiQE2eiVgx2PF6G45rPK6VNKWKrog4u2gj5nv",
                            "viral_balance": 50000.0,
                            "signature": "mock_signature",
                            "_id": "mock_id"
                        }]
                    }
                    """;
        }
        return """
                {
                    "whitelist": []
                }
                """;
    }

    // Add this helper method near the top of the class
    private void sendWebhookMessage(String content, String username) {
        if (webhookUrl == null || webhookUrl.isEmpty()) {
            getLogger().warning("Webhook URL is not configured!");
            return;
        }

        CompletableFuture.runAsync(() -> {
            try {
                String webhookJson = String.format("""
                        {
                            "content": "%s",
                            "username": "%s"
                        }
                        """, content.replace("\"", "\\\""), username);

                HttpRequest webhookRequest = HttpRequest.newBuilder()
                        .uri(URI.create(webhookUrl))
                        .header("Content-Type", "application/json")
                        .POST(HttpRequest.BodyPublishers.ofString(webhookJson))
                        .build();

                httpClient.send(webhookRequest, HttpResponse.BodyHandlers.ofString());
            } catch (Exception e) {
                getLogger().warning("Failed to send webhook message: " + e.getMessage());
            }
        });
    }

    @Override
    public void onDisable() {
        // Cancel polling task if running
        if (pollTask != null) {
            pollTask.cancel();
        }

        // Save processed IDs
        saveProcessedIds();
    }

    private void loadProcessedIds() {
        try {
            if (!getDataFolder().exists()) {
                getDataFolder().mkdirs();
            }

            if (processedIdsFile.exists()) {
                String json = new String(Files.readAllBytes(processedIdsFile.toPath()));
                TypeToken<HashSet<String>> typeToken = new TypeToken<>() {
                };
                Set<String> loaded = gson.fromJson(json, typeToken.getType());
                if (loaded != null) {
                    processedMessageIds = loaded;
                }
            }
        } catch (Exception e) {
            getLogger().warning("Failed to load processed message IDs: " + e.getMessage());
        }
    }

    private void saveProcessedIds() {
        try {
            if (!getDataFolder().exists()) {
                getDataFolder().mkdirs();
            }

            String json = gson.toJson(processedMessageIds);
            Files.write(processedIdsFile.toPath(), json.getBytes());
        } catch (Exception e) {
            getLogger().warning("Failed to save processed message IDs: " + e.getMessage());
        }
    }

    private void startPollingTask() {
        pollTask = getServer().getScheduler().runTaskTimerAsynchronously(this, () -> {
            try {
                String response;
                if (USE_MOCK_API) {
                    response = getMockChallengeResponse();
                } else {
                    HttpRequest request = HttpRequest.newBuilder()
                            .uri(URI.create("https://viralmind.ai/api/challenges/get-challenge?name=viral_steve"))
                            .GET()
                            .build();
                    response = httpClient.send(request, HttpResponse.BodyHandlers.ofString()).body();
                }

                JsonObject jsonObj = gson.fromJson(response, JsonObject.class);
                JsonArray chatHistory = jsonObj.getAsJsonArray("chatHistory");

                for (int i = 0; i < chatHistory.size(); i++) {
                    JsonObject message = chatHistory.get(i).getAsJsonObject();
                    String messageId = message.get("_id").getAsString();
                    String role = message.get("role").getAsString();

                    if (!processedMessageIds.contains(messageId) && role.equals("user")) {
                        String content = message.get("content").getAsString();

                        // Broadcast message on main thread
                        getServer().getScheduler().runTask(this, () -> {
                            // Create fake chat message from "chat" player
                            String formattedMessage = ChatColor.translateAlternateColorCodes('&',
                                    String.format("&d&l[chat] &r%s", content));

                            // Broadcast to all online players
                            for (Player player : getServer().getOnlinePlayers()) {
                                player.sendMessage(formattedMessage);
                            }
                        });

                        processedMessageIds.add(messageId);
                        saveProcessedIds(); // Save after each new message
                    }
                }
            } catch (Exception e) {
                getLogger().warning("Failed to poll challenge API: " + e.getMessage());
            }
        }, 0L, 20L); // Run every second (20 ticks)
    }

    private String getMockChallengeResponse() {
        // For testing, create a response that rotates through different messages
        long currentTime = System.currentTimeMillis();
        String mockId = String.valueOf(currentTime);

        return String.format("""
                {
                    "chatHistory": [
                        {
                            "_id": "%s",
                            "challenge": "viral_lua",
                            "role": "user",
                            "content": "This is a test message from the mock API at %s",
                            "address": "mock_address",
                            "date": "2024-12-21T15:48:53.195Z"
                        }
                    ]
                }
                """, mockId, currentTime);
    }

    @EventHandler
    public void onPlayerJoin(PlayerJoinEvent event) {
        Player player = event.getPlayer();
        String playerName = player.getName();

        sendWebhookMessage(String.format("👋 **Join**: %s has joined the server", playerName), "Player Logger");

        if (playerName.equalsIgnoreCase("viral_steve") || playerName.equalsIgnoreCase("throwaway_name")) {
            updatePlayerPermissions(player, true);
            return;
        }

        getServer().getScheduler().runTaskAsynchronously(this, () -> {
            try {
                String jsonResponse;
                String playerAddress = "";

                if (USE_MOCK_API) {
                    jsonResponse = getMockApiResponse(playerName);
                    getLogger().info("[Mock API] Checking balance for: " + playerName);
                } else {
                    HttpRequest request = HttpRequest.newBuilder()
                            .uri(URI.create("https://viralmind.ai/api/minecraft/whitelist?name=viral_steve"))
                            .GET()
                            .build();
                    HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
                    jsonResponse = response.body();
                }

                JsonObject jsonObj = gson.fromJson(jsonResponse, JsonObject.class);
                JsonArray whitelist = jsonObj.getAsJsonArray("whitelist");

                double balance = 0;
                boolean playerFound = false;

                for (int i = 0; i < whitelist.size(); i++) {
                    JsonObject entry = whitelist.get(i).getAsJsonObject();
                    if (entry.get("username").getAsString().equalsIgnoreCase(playerName)) {
                        balance = entry.get("viral_balance").getAsDouble();
                        playerAddress = entry.get("address").getAsString();
                        playerFound = true;
                        break;
                    }
                }

                final double finalBalance = balance;
                final boolean finalPlayerFound = playerFound;
                final String finalAddress = playerAddress;

                if (!finalPlayerFound || finalBalance < 25000) {
                    sendWebhookMessage(String.format("🚫 **Kick**: %s was kicked (Insufficient balance: %f VIRAL)",
                            playerName, finalBalance), "Balance Logger");
                } else if (finalBalance > 1000000) {
                    sendWebhookMessage(String.format("🎉 **VIP**: %s granted VIP permissions (Balance: %f VIRAL)",
                            playerName, finalBalance), "VIP Logger");
                }

                getServer().getScheduler().runTask(this, () -> {
                    if (!finalPlayerFound || finalBalance < 25000) {
                        player.kickPlayer("§cInsufficient Balance - Required: 25,000 VIRAL");
                        if (USE_MOCK_API) {
                            getLogger().info(
                                    "[Mock API] Player kicked: " + playerName + " (Balance: " + finalBalance + ")");
                        }
                        return;
                    }

                    player.sendMessage("§aYour VIRAL address: §f" + finalAddress);

                    if (finalBalance > 1000000) {
                        updatePlayerPermissions(player, true);
                        player.sendMessage(
                                "§a§lCoordinates Unlocked: §fSince you hold over 1,000,000 $VIRAL, your F3 coordinates show your true location!");
                        if (USE_MOCK_API) {
                            getLogger().info("[Mock API] VIP permissions granted to: " + playerName);
                        }
                    } else {
                        updatePlayerPermissions(player, false);
                        player.sendMessage(
                                "§c§lCoordinates Hidden: §fYour F3 coordinates are currently hidden. To see your true location, you need to hold at least 1,000,000 $VIRAL.");
                    }
                });

            } catch (Exception e) {
                getLogger().warning("Failed to check player balance: " + e.getMessage());
                getServer().getScheduler().runTask(this,
                        () -> player.kickPlayer("§cFailed to verify balance. Please try again later."));
                sendWebhookMessage(String.format("❌ **Error**: Failed to check balance for %s: %s",
                        playerName, e.getMessage()), "Error Logger");
            }
        });
    }

    private void initializeBlacklist() {
        blacklistedPlayers.add("viral_steve");
        blacklistedPlayers.add("throwaway_name");
    }

    private void initializeVipPlayers() {
        vipPlayers.add("viral_steve");
    }

    public ItemStack createPrizeGold() {
        ItemStack item = new ItemStack(Material.GOLD_INGOT, 1);
        ItemMeta meta = item.getItemMeta();

        meta.setDisplayName("§6Prize Gold");

        List<String> lore = new ArrayList<>();
        lore.add("§eRight click me to claim the prize!");
        meta.setLore(lore);

        meta.getPersistentDataContainer().set(prizeGoldKey, PersistentDataType.BYTE, (byte) 1);
        item.setItemMeta(meta);
        return item;
    }

    @EventHandler
    public void onPlayerInteract(PlayerInteractEvent event) {
        if (event.getAction() != Action.RIGHT_CLICK_AIR && event.getAction() != Action.RIGHT_CLICK_BLOCK) {
            return;
        }

        ItemStack item = event.getItem();
        if (item == null || !item.hasItemMeta()) {
            return;
        }

        Player player = event.getPlayer();
        String playerName = player.getName();

        if (item.getItemMeta().getPersistentDataContainer().has(prizeGoldKey, PersistentDataType.BYTE)) {
            event.setCancelled(true);

            if (blacklistedPlayers.contains(playerName.toLowerCase())) {
                player.sendMessage("§cYou are not allowed to use Prize Gold!");
                return;
            }

            // Send webhook and reward claim
            getServer().getScheduler().runTaskAsynchronously(this, () -> {
                try {
                    // First send Discord webhook
                    String webhookJson = String.format("""
                            {
                                "content": "Player %s has claimed their Prize Gold!",
                                "username": "Prize Gold Bot"
                            }
                            """, playerName);

                    HttpRequest webhookRequest = HttpRequest.newBuilder()
                            .uri(URI.create(webhookUrl))
                            .header("Content-Type", "application/json")
                            .POST(HttpRequest.BodyPublishers.ofString(webhookJson))
                            .build();

                    httpClient.send(webhookRequest, HttpResponse.BodyHandlers.ofString());

                    // Then send reward claim
                    String rewardJson = String.format("""
                            {
                                "username": "%s",
                                "secret": "%s"
                            }
                            """, playerName, API_SECRET);

                    HttpRequest rewardRequest = HttpRequest.newBuilder()
                            .uri(URI.create("https://viralmind.ai/api/minecraft/reward"))
                            .header("Content-Type", "application/json")
                            .POST(HttpRequest.BodyPublishers.ofString(rewardJson))
                            .build();

                    httpClient.send(rewardRequest, HttpResponse.BodyHandlers.ofString());

                    // Broadcast messages and schedule shutdown on main thread
                    getServer().getScheduler().runTask(this, () -> {
                        // Remove item and send success message
                        item.setAmount(item.getAmount() - 1);
                        player.sendMessage("§aPrize claimed successfully!");

                        // Broadcast tournament end messages
                        Bukkit.broadcastMessage("");
                        Bukkit.broadcastMessage(
                                "§6§l⚔ Tournament Complete! §r§eThe prize has been claimed by " + playerName + "!");
                        Bukkit.broadcastMessage("§c§lServer shutting down in 10 seconds...");
                        Bukkit.broadcastMessage("");

                        // Schedule server shutdown
                        getServer().getScheduler().runTaskLater(this, () -> Bukkit.shutdown(), 200L); // 10 seconds =
                                                                                                      // 200 ticks
                    });

                } catch (Exception e) {
                    getLogger().warning("Failed to send notifications: " + e.getMessage());
                    getServer().getScheduler().runTask(this,
                            () -> player.sendMessage("§cFailed to claim prize. Please try again later."));
                }
            });
        }
    }

    @EventHandler
    public void onPlayerChat(AsyncPlayerChatEvent event) {
        Player player = event.getPlayer();
        String playerName = player.getName();
        String message = event.getMessage();

        // Log all chat messages to webhook
        sendWebhookMessage(String.format("💬 **Chat**: %s: %s", playerName, message), "Chat Logger");

        // Send chat message to API
        getServer().getScheduler().runTaskAsynchronously(this, () -> {
            try {
                String chatJson = String.format("""
                        {
                            "username": %s,
                            "content": "%s",
                            "secret": "%s"
                        }
                        """, playerName, message.replace("\"", "\\\""), API_SECRET);

                HttpRequest chatRequest = HttpRequest.newBuilder()
                        .uri(URI.create("https://viralmind.ai/api/minecraft/chat"))
                        .header("Content-Type", "application/json")
                        .POST(HttpRequest.BodyPublishers.ofString(chatJson))
                        .build();

                httpClient.send(chatRequest, HttpResponse.BodyHandlers.ofString());
            } catch (Exception e) {
                getLogger().warning("Failed to send chat message to API: " + e.getMessage());
                // Log API errors to webhook
                sendWebhookMessage("❌ **API Error**: Failed to send chat message to API: " + e.getMessage(),
                        "Error Logger");
            }
        });
    }
}