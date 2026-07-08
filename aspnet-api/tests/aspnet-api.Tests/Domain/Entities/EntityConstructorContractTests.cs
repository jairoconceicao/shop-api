using System.Reflection;
using aspnet_api.Domain.Entities;
using Xunit;

namespace aspnet_api.Tests.Domain.Entities;

public class EntityConstructorContractTests
{
    public static IEnumerable<object[]> Entities =>
    [
        [typeof(Carrinho)],
        [typeof(CarrinhoItem)],
        [typeof(CategoriaProduto)],
        [typeof(Cliente)],
        [typeof(Estoque)],
        [typeof(MovimentoEstoque)],
        [typeof(Pedido)],
        [typeof(PedidoItem)],
        [typeof(Produto)],
        [typeof(Sessao)],
        [typeof(Usuario)]
    ];

    [Theory]
    [MemberData(nameof(Entities))]
    public void DevePossuirApenasUmConstrutorPublicoSemParametros(Type entityType)
    {
        var constructors = entityType.GetConstructors(BindingFlags.Public | BindingFlags.Instance);

        Assert.Single(constructors);
        Assert.Empty(constructors[0].GetParameters());
    }
}
