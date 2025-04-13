
cat > localhost.cnf <<EOF
[ req ]
default_bits        = 2048
default_keyfile     = localhost.key
distinguished_name  = req_distinguished_name
req_extensions      = req_ext
[ req_distinguished_name ]
commonName          = Common Name (e.g. server FQDN or YOUR name)
commonName_max      = 64
commonName_default  = Localhost Root CA
[ req_ext ]
subjectAltName      = @alt_names
[alt_names]
DNS.1               = desktop
DNS.2               = *.desktop
EOF

openssl req -new -nodes -out localhost.csr -config localhost.cnf
openssl x509 -req -in localhost.csr -days 365 -out localhost.crt -signkey localhost.key -extensions req_ext -extfile localhost.cnf
