workspace "Encurtador de URLs" "Sistema para encurtar URLs e visualizar analytics" {

    model {
        user = person "Usuário" "Pessoa que encurta URLs e visualiza estatísticas de acesso"
        
        urlShortenerSystem = softwareSystem "Sistema de Encurtador de URLs" "Permite encurtar URLs, redirecionar acessos e visualizar analytics de cliques"
        
        user -> urlShortenerSystem "Encurta URLs, acessa links encurtados e visualiza analytics"
    }

    views {
        systemContext urlShortenerSystem "SystemContext" {
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
        }
    }
}