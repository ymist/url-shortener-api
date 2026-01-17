workspace "Encurtador de URLs" "Sistema para encurtar URLs e visualizar analytics" {

    model {
        user = person "Usuário" "Pessoa que encurta URLs e visualiza estatísticas de acesso"
        
        urlShortenerSystem = softwareSystem "Sistema de Encurtador de URLs" "Permite encurtar URLs, redirecionar acessos e visualizar analytics de cliques" {
            webApp = container "Aplicação Web" "Interface do usuário" "Next.js" {
                tags "Web Browser"
            }
            
            apiApplication = container "API Application" "Fornece funcionalidades via API REST" "Node.js + Fastify + TypeScript" {
                tags "API"
            }
            
            database = container "Database" "Armazena URLs encurtadas, usuários e analytics" "PostgreSQL" {
                tags "Database"
            }
            
            cache = container "Cache" "Cache de URLs para redirecionamento rápido" "Redis" {
                tags "Cache"
            }
        }
        
        # Relationships
        user -> webApp "Usa" "HTTPS"
        user -> apiApplication "Acessa links encurtados" "HTTPS"
        webApp -> apiApplication "Consome API" "JSON/HTTPS"
        apiApplication -> database "Lê e escreve dados" "Drizzle ORM"
        apiApplication -> cache "Lê e escreve cache" "Redis Protocol"
    }

    views {
        systemContext urlShortenerSystem "SystemContext" {
            include *
            autolayout lr
        }
        
        container urlShortenerSystem "Containers" {
            include *
            autolayout lr
        }

        styles {
            element "Person" {
                shape person
                background #08427b
                color #ffffff
            }
            element "Software System" {
                background #1168bd
                color #ffffff
            }
            element "Web Browser" {
                shape WebBrowser
                background #438dd5
                color #ffffff
            }
            element "API" {
                shape hexagon
                background #438dd5
                color #ffffff
            }
            element "Database" {
                shape cylinder
                background #438dd5
                color #ffffff
            }
            element "Cache" {
                shape cylinder
                background #85bbf0
                color #000000
            }
        }
    }
}